import './declaration.d';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import './App.css';
import Epub from 'epubjs';
import vocab from './hsk.json';
// @ts-ignore
import {sify} from 'chinese-conv';
import {render} from 'react-dom';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import {combineLatest, merge, Observable, Subject} from "rxjs";
import Book from "epubjs/types/book";
import {flattenDeep} from 'lodash';
import {Card} from "./lib/worker-safe/Card";
import {FlashcardPopup} from "./lib/FlashcardPopup";
import {CardTree} from "./lib/components/Card-Tree";
import {AnkiPackageManager} from "./AnkiPackageManager";
import {SerializedAnkiPackage, UnserializedAnkiPackage} from "./lib/worker-safe/SerializedAnkiPackage";
import {reduce, scan} from "rxjs/operators";

// @ts-ignore
window.$ = $;

interface Vocab {
    id: number;
    hanzi: string;
    pinyin: string;
    translations: string[]
}

interface VocabMap {
    [key: string]: Vocab;
}

function makeVocab(hanzi: string, pinyin: string, ...translations: string[]): Vocab {
    return {
        id: 0,
        hanzi,
        pinyin,
        translations
    }
}

// import * as ranges from './ranges.json';
const v: Vocab[] = vocab;
const myVocab: Vocab[] = [
        makeVocab('却', 'qu4', 'however', 'yet'),
        makeVocab('仙', 'xien1', 'magical')
    ]
;
const vocabMap: VocabMap = v.concat(myVocab).reduce((acc: VocabMap, v: Vocab) => {
    acc[v.hanzi.normalize()] = v;
    return acc;
}, {})

class BookManager {
    bookList$: Subject<string[]> = new Subject<string[]>();
    currentBookName$: Subject<string | undefined> = new Subject<string | undefined>();
    bookLoadingMessages$: Subject<string> = new Subject();
    currentBook$: Subject<Book | undefined> = new Subject();

    constructor(bookNames: string[]) {
        this.bookList$.next(bookNames);
        this.currentBookName$.subscribe(filename => {
            if (filename) {
                this.bookLoadingMessages$.next(`Loading and unzipping ${filename}`);
                let book = Epub(filename, {});
                this.bookLoadingMessages$.next(`Loading ${filename} complete`);
                this.currentBook$.next(book);
            }
        });
        this.currentBookName$.next(bookNames.length ? bookNames[0] : undefined);
    }
}

const m = new BookManager([
    'pg23962.epub',
    'test.epub',
    '老舍全集.epub'
]);

function useObs<T>(obs$: Observable<T>, init?: T) {
    const [v, setV] = useState(init)
    useEffect(() => {
        obs$.subscribe(newV => {
            setV(newV);
        })
    }, [obs$])
    return v;
}

const pm = new AnkiPackageManager();

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

const messageBuffer$ = merge(pm.messages$, m.bookLoadingMessages$).pipe(scan((acc: string[], message: string) => {
    acc.unshift(message);
    let strings = acc.slice(0, 100);
    return strings;
}, []));


function App() {
    const [b, setB] = useState();
    const [ankiPackage, setAnkiPackage] = useState();
    const book = useObs<Book | undefined>(m.currentBook$)
    const packageManager = useObs(pm.packages$, pm.packages$.getValue());
    const currentPackage = useObs(pm.currentPackage$, pm.currentPackage$.getValue());
    const packages = useObs(pm.packages$, pm.packages$.getValue());
    const books = useObs(m.bookList$, []);

    const messageList = useObs(messageBuffer$, []);

    useEffect(() => {
        combineLatest(
            m.currentBook$,
            pm.currentPackage$
        ).subscribe(async ([book, p]) => {
            let elementById = document.getElementById('book');
            if (!elementById) {
                throw new Error("Book element not found")
            }
            if (book) {
                const rendition = book.renderTo(elementById, {width: 600, height: 400})
                debugger;
                const target = 'TODO'
                await rendition.display(target);
                if (p) {
                    annotateElements(target, p);
                }
            }
        })
    }, [])

    return (
        <div>
            <ul style={{position: 'fixed',  top: '1em', right: '0px', width: '33vw', border: 'solid black 1px', borderRadius: '3px'}}>
                {messageList && messageList.map(m => <li>{m}</li>)}
            </ul>
            <div style={{
                left: '0px',
                width: '77vw',
                border: 'solid black 1px',
                borderRadius: '3px',
                display: 'flex',
                justifyContent: 'space-around'
            }}>
                <span>Active Collection: {currentPackage?.name}</span>
                <span>Active Book: {book?.path}</span>
            </div>
            <div style={{}}>
                {packages && <CardTree ankiPackages={packages}/>}
            </div>
            {/*
            <div style={{position: "relative", top: '20vh', height: "80vh", width: '80vw'}}>
                {" "}
                <div id="book"/>
            </div>
*/}
        </div>
    );
}

export default App;
