import {ITrie} from "../../Interfaces/Trie";
import {ITryChar} from "../../Interfaces/Annotation/ITryChar";
import {IWordInProgress} from "../../Interfaces/Annotation/IWordInProgress";
import {maxBy} from "lodash";
import $ from "jquery";
import {RenderingBook} from "./RenderingBook";

export class AnnotatedElement {
    private $originalContent: JQuery<HTMLElement>;

    constructor(
        public r: RenderingBook,
        public $leafParent: JQuery<HTMLElement>
    ) {
        this.$originalContent = $leafParent.children();
    }

    annotate(t: ITrie, uniqueLengths: number[]) {
        if (!uniqueLengths.length) {
            return;
        }
        const text = this.$originalContent.text();
        this.$leafParent.empty();
        const characters: ITryChar[] = Array(text.length);
        let wordsInProgress: IWordInProgress[] = [];
        // So now we have a trie lets compate the index of things in a string
        for (let i = 0; i < text.length; i++) {
            wordsInProgress = wordsInProgress.map(w => {
                w.lengthRemaining--;
                return w;
            }).filter(w => w.lengthRemaining > 0);
            const strings = uniqueLengths.map(size => text.substr(i, size));
            const wordsWhichStartHere: string[] = strings.reduce((acc: string[], str) => {
                if (t.hasWord(str)) {
                    acc.push(str);
                }
                return acc;
            }, []);
            if (wordsWhichStartHere.length) {
                debugger;console.log();
            }
            wordsInProgress.push(...wordsWhichStartHere.map(word => ({word, lengthRemaining: word.length})))
            let words = wordsInProgress.map(({word, lengthRemaining}) => ({
                word,
                position: word.length - lengthRemaining
            }));
            let maxWord = maxBy(words, w => w.word.length);
            let el = $(`<mark >${text[i]}</mark>`);
            el.appendTo(this.$leafParent)
            let iTryChar = {
                char: text[i],
                words: words,
                word: maxWord,
                el: el
            };
            iTryChar.el.on("click", (ev) => {
                if (maxWord) {
                    this.$leafParent.children('.highlighted').removeClass('highlighted')
                    const elementsToHighlight = [];
                    const startIndex = i - maxWord.position;
                    for (let i = startIndex; i < startIndex + maxWord.word.length; i++) {
                        elementsToHighlight.push(characters[i].el);
                    }
                    elementsToHighlight.forEach(e => e.addClass('highlighted'))
                    this.r.m.requestEditWord$.next(maxWord.word);
                }
            })
            characters[i] = iTryChar;
        }
    }
}