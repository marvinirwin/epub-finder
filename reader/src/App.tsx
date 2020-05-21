import './declaration.d';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import './App.css';
import Epub from 'epubjs';
import vocab from './hsk.json';
import Rendition from "epubjs/types/rendition";
// @ts-ignore
import {sify} from 'chinese-conv';
import {FlashcardPopup, loadAnkiPackageFromFile} from "./Anki";
import ReactTooltip from "react-tooltip";
import {render} from 'react-dom';

// export for others scripts to use
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


let book = Epub("pg23962.epub", {});


function App() {
    const [b, setB] = useState();
    const [ankiPackage, setAnkiPackage] = useState();
    useEffect(() => {
        (async () => {
            const apkg = await loadAnkiPackageFromFile('Game.zip');
            await book.ready;
            let elementById = document.getElementById('book');
            if (elementById) {
                const rendition = book.renderTo(elementById, {width: 600, height: 400})
                let target = '#id00707';
                rendition.display(target).then(() => {
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
                            let t = apkg.cardMap[text];
                            if (t) {
                                e.addClass('hoverable')
                                let htmlElements = e.get(0);
                                render(<FlashcardPopup card={t[0]} text={text}/>, htmlElements);
                            }
                        })
                    })
                });

            }
            setB(book)
        })()
    }, []);

    return (
        <div>
            <ReactTooltip
                html
                event="mouseenter"
                eventOff="mouseleave click"
            >YEEET</ReactTooltip>

            <div style={{position: "relative", top: '20vh', height: "80vh", width: '80vw'}}>
                {" "}
                <div id="book"/>
            </div>
        </div>
    );
}

export default App;
