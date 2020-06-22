import {ITrie} from "../../Interfaces/Trie";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../../Interfaces/Annotation/IWordInProgress";
import {maxBy, Dictionary} from "lodash";
import $ from "jquery";
import {RenderingBook} from "./RenderingBook";
import {IPositionedWord} from "../../Interfaces/Annotation/IPositionedWord";

export class AnnotatedElement {
    private $originalContent: string;

    constructor(
        public r: RenderingBook,
        public $leafParent: JQuery<HTMLElement>
    ) {
        this.$originalContent = $leafParent.text();

    }

    annotate(t: ITrie, uniqueLengths: number[]): Dictionary<IAnnotatedCharacter[]> {
        if (!uniqueLengths.length) {
            return {};
        }
        const text = this.$originalContent;
        this.$leafParent.empty();
        const elsMappedToWords: Dictionary<IAnnotatedCharacter[]> = {};
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
            wordsInProgress.push(...wordsWhichStartHere.map(word => ({word, lengthRemaining: word.length})))
            let words: IPositionedWord[] = wordsInProgress.map(({word, lengthRemaining}) => {
                let newWord: IPositionedWord = {
                    word,
                    position: word.length - lengthRemaining
                };
                return newWord;
            });
            let maxWord:IPositionedWord | undefined = maxBy(words, w => w.word.length);
            let el = $(`<mark >${text[i]}</mark>`);
            el.appendTo(this.$leafParent)
            let annotationElement: IAnnotatedCharacter = {
                char: text[i],
                words: words,
                el: el
            };
            annotationElement.words.forEach(w => {
                if (elsMappedToWords[w.word]) {
                    elsMappedToWords[w.word].push(annotationElement);
                } else {
                    elsMappedToWords[w.word] = [annotationElement]
                }
            })

            if (maxWord) {
                this.applyMouseEvents(annotationElement, maxWord, i);
            }
        }
        return elsMappedToWords;
    }

    private applyMouseEvents(annotationElement: IAnnotatedCharacter, maxWord: IPositionedWord, i: number) {
        annotationElement.el.on("mouseenter", (ev) => {
            this.r.m.highlightedWord$.next(maxWord.word);
        });
        annotationElement.el.on('mouseleave', (ev) => {
            this.r.m.highlightedWord$.next();
        })
        annotationElement.el.on("click", (ev) => {
            this.$leafParent.children('.highlighted').removeClass('highlighted')
/*
            const elementsToHighlight = [];
            const startIndex = i - maxWord.position;
            for (let i = startIndex; i < startIndex + maxWord.word.length; i++) {
                elementsToHighlight.push(characters[i].el);
            }
            elementsToHighlight.forEach(e => e.addClass('highlighted'))
*/
            this.r.m.requestEditWord$.next(maxWord.word);
        })
        return i;
    }
}