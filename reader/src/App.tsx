import './declaration.d';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import './App.css';
import Epub from 'epubjs';
// @ts-ignore
import {sify} from 'chinese-conv';
import {render} from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import {BehaviorSubject, combineLatest, merge, Observable, ReplaySubject, Subject} from "rxjs";
import Book from "epubjs/types/book";
import {FlashcardPopup} from "./lib/FlashcardPopup";
import {CardTree} from "./lib/components/Card-Tree";
import {AnkiPackageManager} from "./AnkiPackageManager";
import {UnserializedAnkiPackage} from "./lib/worker-safe/SerializedAnkiPackage";
import {map, scan} from "rxjs/operators";
import {MessageList} from "./lib/components/MessageLlist";
import {useObs} from "./UseObs";
import {Dictionary} from 'lodash';
import Spine from "epubjs/types/spine";
import {SpineItem} from "epubjs/types/section";


// @ts-ignore
window.$ = $;


interface BookInstance {
    message: string;
    name: string;
    book: Book | undefined;
}

class BookManager {
    bookList$: BehaviorSubject<Dictionary<BookInstance>> = new BehaviorSubject<Dictionary<BookInstance>>({});
    currentBook$: BehaviorSubject<BookInstance | undefined> = new BehaviorSubject<BookInstance | undefined>(undefined)
    bookLoadUpdates$: Subject<BookInstance> = new Subject();
    spine$: ReplaySubject<Spine | undefined> = new ReplaySubject(1);

    constructor(bookNames: string[]) {
        bookNames.forEach(n => this.loadBookIstance(n, n))
        this.bookLoadUpdates$.subscribe(v => {
            this.bookList$.next({
                ...this.bookList$.getValue(),
                [v.name]: v
            })
        });

        this.currentBook$.pipe(map(function (bookInstance: BookInstance | undefined): Spine | undefined {
            if (bookInstance) {
                if (bookInstance.book) {
                    return bookInstance.book.spine
                }
            }
            return undefined
        })).subscribe(this.spine$);

        combineLatest(this.bookList$, this.currentBook$).subscribe(([bookList, currentBook]) => {
            if (!currentBook) {
                const f = Object.entries(bookList).find(([k, v]) => v.book);
                if (f) this.currentBook$.next(f[1]);
            }
        })
    }

    async loadBookIstance(path: string, name: string) {
        this.bookLoadUpdates$.next({
            name,
            book: undefined,
            message: `Loading ${name} from ${path}`
        });
        const book: Book = Epub(path);
        await book.ready
        this.bookLoadUpdates$.next({
            name,
            book,
            message: `Loaded ${name}`
        });
    }
}


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
    const book = useObs<BookInstance | undefined>(m.currentBook$, m.currentBook$.getValue())
    const currentPackage = useObs(pm.currentPackage$, pm.currentPackage$.getValue());
    const bookList = useObs(m.bookList$, m.bookList$.getValue());
    const packages = useObs(pm.packages$, pm.packages$.getValue());
    const spine = useObs<SpineItem[] | undefined>(m.spine$.pipe(map(s => {
        if (!s) return;
        const a: SpineItem[] = [];
        s.each((f: SpineItem) => {
            debugger;
            a.push(f);
        })
        return a;
    })));

    useEffect(() => {
        combineLatest(
            m.currentBook$,
            pm.currentPackage$
        ).subscribe(async ([bookInstance, p]) => {
            // Render
            if (bookInstance && bookInstance.book) {
                let elementById = document.getElementById('book');

                if (!elementById) {
                    throw new Error("Book element not found")
                }
                elementById.textContent = '';// clear the element
                const rendition = bookInstance.book.renderTo(elementById, {width: 600, height: 400})
                const target = bookInstance.book.spine.get(0).href;
                await rendition.display(target);
                if (p) {
                    annotateElements(target, p);
                }
            }
        })
    }, [])

    return (
        <div>
            <div className={'message-list'}>
                <MessageList messageBuffer$={messageBuffer$}/>
            </div>
            <div className={'nav-bar'}>
                <span>Active Collection: {currentPackage?.name}</span>
                <span>Active Book: {book?.name}</span>
            </div>
            <div className={'card-tree'}>
                {packages && <CardTree ankiPackages={packages}/>}
            </div>
            <div className={'spine'}>
                <ul>
                    {spine && spine.map(s => <li>{s.href}</li>)}
                </ul>;
            </div>
            <div className={'book-list'}>
                <ul>
                    {bookList && Object.values(bookList).map(s => <li>{s.name}</li>)}
                </ul>;
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
