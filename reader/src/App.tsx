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
import {BookMenu, SpineItemMenu} from "./lib/components/SpineItemMenu";
import DebugMessage from "./Debug-Message";
import {trie} from "./lib/Trie";
import {isChineseCharacter} from "./lib/worker-safe/Card";

// @ts-ignore
window.$ = $;

const CHAR_LIMIT = 5;

function windDownStringIntoTrie(currentSection: string[], t: trie<number>, i: number) {
    if (currentSection.length) {
        for (let j = 0; j < currentSection.length; j++) {
            const str = currentSection.slice(j).join('');
            t.insert(str, i + j);
        }
    }
}

function annotateElements(
    target: string,
    p: UnserializedAnkiPackage,
    messageSender: (s: string) => void) {
    return new Promise((resolve, reject) => {
        let $iframe = $('iframe');
        messageSender(`Starting render`)
        let contents = $iframe.contents();
        debugger;
        let body = contents.find('body');
        const characters = body.text().normalize();
/*
        const t = new trie<number>();
        let currentSection: string[] = [];
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            if (isChineseCharacter(char)) {
                if (currentSection.length >= CHAR_LIMIT) {
                    // Insert into the trie all characters
                    t.insert(currentSection.join(''), i)
                    currentSection.splice(currentSection.length - 1, 1) // TODO this deletes the last, right?
                } else {
                    currentSection.push(char);
                }
            } else {
                windDownStringIntoTrie(currentSection, t, i);
                currentSection = [];
            }
        }
*/
        const root = $('<div/>');
        const popupElements: JQuery[] = [];
        let currentEl = $('<span/>');
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const word = sify(char);
            const el = $('<span/>');
            el.text(word);
            if (isChineseCharacter(char)) {
                popupElements.push(el);
            }
            root.append(el);
        }
        body.children().remove();
        body.append(root);
        setTimeout(() => {
            messageSender(`Mounting flashcards`)
            popupElements.forEach(e => {
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
        return acc.slice(0, 100);
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
/*
                    if (!item.href) {
                        throw new Error("Item does not have href");
                    }
*/
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
