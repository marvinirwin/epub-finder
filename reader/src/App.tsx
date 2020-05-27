import './declaration.d';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import './App.css';
// @ts-ignore
import {sify} from 'chinese-conv';
import {render} from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import {combineLatest, merge, Observable, ReplaySubject} from "rxjs";
import {FlashcardPopup} from "./lib/FlashcardPopup";
import {CardTree} from "./lib/components/Card-Tree";
import {AnkiPackageManager} from "./AnkiPackageManager";
import {UnserializedAnkiPackage} from "./lib/worker-safe/SerializedAnkiPackage";
import {map, scan} from "rxjs/operators";
import {MessageList} from "./lib/components/MessageLlist";
import {useObs} from "./UseObs";
import {BookInstance, BookManager} from "./BookManager";
import {SpineItemMenu, BookMenu} from "./lib/components/SpineItemMenu";
import DebugMessage from "./Debug-Message";

// @ts-ignore
window.$ = $;

function annotateElements(target: string, p: UnserializedAnkiPackage, messageSender: (s: string) => void) {
    return new Promise((resolve, reject) => {
        let $iframe = $('iframe');
        messageSender(`Starting render`)
        let contents = $iframe.contents();
        let body = contents.find('body');
        const words = body.text().normalize().split('');
        const root = $('<div/>');
        const wordEls: JQuery[] = [];
        for (let i = 0; i < words.length; i++) {
            const word = sify(words[i]);
            const el = $('<span/>');

            el.text(word);
            wordEls.push(el);

            root.append(el);
        }
        body.children().remove();
        body.append(root);
        setTimeout(() => {
            messageSender(`Mounting flashcards`)
            wordEls.forEach(e => {
                let text = e.text();
                let t = (p.cardIndex || {})[text];
                if (t) {
                    e.addClass('hoverable')
                    let htmlElements = e.get(0);
                    render(<FlashcardPopup card={t[0]} text={text}/>, htmlElements);
                }
            })
            messageSender(`Finished Render`)
            resolve()
        })
        body.append(`
                    <style>
.hoverable {
  background-color: lightyellow;
}
.hoverable:hover {
  background-color: lightgreen;
}
</style>
                    `)
    })
}

class RenderManager {
    messages$: ReplaySubject<string> = new ReplaySubject<string>(1)
}

interface AppSingleton {
    m: BookManager,
    pm: AnkiPackageManager,
    messageBuffer$: Observable<DebugMessage[]>
    renderManager: RenderManager,
}

function initializeApp(): AppSingleton {
    const m = new BookManager([
        'pg23962.epub',
        'test.epub',
        '老舍全集.epub'
    ]);
    const pm = new AnkiPackageManager();
    let renderManager = new RenderManager();
    const messageBuffer$ = merge(
        pm.messages$,
        renderManager.messages$.pipe(map(msg => new DebugMessage(`render`, msg))),
        m.bookLoadUpdates$.pipe(map(f => new DebugMessage(f.name, f.message)))
    ) .pipe(scan((acc: DebugMessage[], message: DebugMessage) => {
        acc.unshift(message);
        let debugMessages = acc.slice(0, 100);
        return debugMessages;
    }, []));

    return {
        m,
        pm,
        messageBuffer$,
        renderManager: renderManager
    }
}

function HauptMask({s}: { s: AppSingleton }) {
    const {m, pm, messageBuffer$, renderManager} = s;
    const book = useObs<BookInstance | undefined>(m.currentBook$)
    const currentPackage = useObs(pm.currentPackage$);
    const packages = useObs(pm.packages$, pm.packages$.getValue());

    const [renderInProgress, setRenderInProgress] = useState<Promise<any> | undefined>(undefined)
    const [nextRender, setNextRender] = useState<(() => Promise<any>) | undefined>(undefined)

    useEffect(() => {
        if (!renderInProgress && nextRender) {
            setNextRender(undefined);
            setRenderInProgress(nextRender().then(() => setRenderInProgress(undefined)))
        }
    }, [renderInProgress, nextRender]);

    useEffect(() => {
        combineLatest(
            m.currentBook$,
            pm.currentPackage$,
            m.currentSpineItem$
        ).subscribe(([bookInstance, p, item]) => {
            const render = async () => {
                // Render
                if (bookInstance && bookInstance.book && item) {
                    let elementById = document.getElementById('book');
                    if (!elementById) {
                        throw new Error("Book element not found")
                    }
                    elementById.textContent = '';// clear the element
                    const rendition = bookInstance.book.renderTo(elementById, {width: 600, height: 400})
                    if (!item.href) {
                        throw new Error("Item does not have href");
                    }
                    const target = item.href;
                    await rendition.display(target);
                    if (p) {
                        annotateElements(target, p, s => renderManager.messages$.next(s));
                    }
                }
            }
            setNextRender(() => render);
        })
    }, [])

    return (
        <div className={'root'}>
            <div className={'card-tree-container'}>
                {packages && <CardTree ankiPackages={packages} selectedPackage$={pm.currentPackage$}/>}
            </div>
            <div className={'nav-bar'}>
                <div className={'spine-menu-container'}>
                    <SpineItemMenu spine$={m.spineItems$} selectedSpineElement$={m.currentSpineItem$}/>
                </div>
                <div className={'book-menu-container'}>
                    <BookMenu books$={m.bookList$} selectedBook$={m.currentBook$}/>
                </div>
                <div>Active Collection: {currentPackage?.name}</div>
                <div>Active Book: {book?.name}</div>
                <div className={'message-list-container'}>
                    <MessageList messageBuffer$={messageBuffer$}/>
                </div>
            </div>
            <div className={'text-display'}>
                {" "}
                <div id="book"/>
            </div>
        </div>
    );
}

function App() {
    const [appSingleton, setAppSingleton] = useState();
    useEffect(() => {
        setAppSingleton(initializeApp())
    }, [])
    return appSingleton ? <HauptMask s={appSingleton}/> : <div>Initializing..</div>;
}

export default App;
