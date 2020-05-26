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
import {BehaviorSubject, combineLatest, merge, Observable, ReplaySubject, Subject} from "rxjs";
import {FlashcardPopup} from "./lib/FlashcardPopup";
import {CardTree} from "./lib/components/Card-Tree";
import {AnkiPackageManager} from "./AnkiPackageManager";
import {UnserializedAnkiPackage} from "./lib/worker-safe/SerializedAnkiPackage";
import {map, scan} from "rxjs/operators";
import {MessageList} from "./lib/components/MessageLlist";
import {useObs} from "./UseObs";
import {BookInstance, BookManager} from "./BookManager";
import {SpineItem} from "epubjs/types/section";
import {SpineItemMenu ,BookMenu} from "./lib/components/SpineItemMenu";

// @ts-ignore
window.$ = $;

function annotateElements(target: string, p: UnserializedAnkiPackage) {
    const parent = $('iframe').contents().find(target);
    parent.parent().append(`
                    <style>
.hoverable {
  background-color: lightyellow;
}
.hoverable:hover {
  background-color: lightgreen;
}
</style>
                    `)
    const words = parent.text().normalize().split('');
    const root = $('<div/>');
    const wordEls: JQuery[] = [];
    for (let i = 0; i < words.length; i++) {
        const word = sify(words[i]);
        const el = $('<span/>');

        el.text(word);
        wordEls.push(el);

        root.append(el);
    }
    parent.text('');
    parent.append(root);
    setTimeout(() => {
        wordEls.forEach(e => {
            let text = e.text();
            let t = (p.cardIndex || {})[text];
            if (t) {
                e.addClass('hoverable')
                let htmlElements = e.get(0);
                render(<FlashcardPopup card={t[0]} text={text}/>, htmlElements);
            }
        })
    })
}


interface AppSingleton {
    m: BookManager,
    pm: AnkiPackageManager,
    messageBuffer$: Observable<string[]>
}

function initializeApp(): AppSingleton {
    const m = new BookManager([
        'pg23962.epub',
        'test.epub',
        '老舍全集.epub'
    ]);
    const pm = new AnkiPackageManager();
    const messageBuffer$ = merge(pm.messages$, m.bookLoadUpdates$.pipe(map(f => f.message))).pipe(scan((acc: string[], message: string) => {
        acc.unshift(message);
        let strings = acc.slice(0, 100);
        return strings;
    }, []));

    return {
        m,
        pm,
        messageBuffer$
    }
}


function HauptMask({s}: { s: AppSingleton }) {
    const {m, pm, messageBuffer$} = s;
    const book = useObs<BookInstance | undefined>(m.currentBook$)
    const currentPackage = useObs(pm.currentPackage$, pm.currentPackage$.getValue());
    const bookList = useObs(m.bookDict$, m.bookDict$.getValue());
    const packages = useObs(pm.packages$, pm.packages$.getValue());

    useEffect(() => {
        combineLatest(
            m.currentBook$,
            pm.currentPackage$,
            m.currentSpineItem$
        ).subscribe(async ([bookInstance, p, item]) => {
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
                    annotateElements(target, p);
                }
            }
        })
    }, [])

    return (
        <div className={'root'}>
            <div className={'card-tree-container'}>
                {packages && <CardTree ankiPackages={packages}/>}
            </div>
            <div className={'nav-bar'}>
                <div className={'spine-menu-container'}>
                    <SpineItemMenu spine$={m.spineItems$} selectedSpineElement$={m.currentSpineItem$} />
                </div>
                <div className={'book-menu-container'}>
                    <BookMenu books$={m.bookList$} selectedBook$={m.currentBook$} />
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
