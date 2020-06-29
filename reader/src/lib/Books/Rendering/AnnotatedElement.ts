import {ITrie} from "../../Interfaces/Trie";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../../Interfaces/Annotation/IWordInProgress";
import {maxBy, Dictionary} from "lodash";
import $ from "jquery";
import {RenderingBook} from "./RenderingBook";
import {IPositionedWord} from "../../Interfaces/Annotation/IPositionedWord";

export class AnnotatedElement {
    private leafText: string;

    constructor(
        public r: RenderingBook,
        public $leafParent: JQuery<HTMLElement>
    ) {
        this.leafText = $leafParent.text();
        this.$leafParent.addClass('annotated_and_translated');
        this.applyParentMouseEvents();
    }

    annotate(t: ITrie, uniqueLengths: number[]): Dictionary<IAnnotatedCharacter[]> {
        if (!uniqueLengths.length) {
            return {};
        }
        const text = this.leafText;
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
            let maxWord: IPositionedWord | undefined = maxBy(words, w => w.word.length);
            const el = document.createElement('MARK');
            el.textContent = text[i];
/*
            let el = $(`<mark >${text[i]}</mark>`);
*/
            this.$leafParent.append(el);
/*
            el.appendTo(this.$leafParent)
*/
            let annotationElement: IAnnotatedCharacter = {
                char: text[i],
                words: words,
                el: $(el)
            };
            annotationElement.words.forEach(w => {
                if (elsMappedToWords[w.word]) {
                    elsMappedToWords[w.word].push(annotationElement);
                } else {
                    elsMappedToWords[w.word] = [annotationElement]
                }
            })

            if (maxWord) {
                this.applySingleElementMouseEvents(annotationElement, maxWord, i);
            }
        }
        return elsMappedToWords;
    }

    private applyParentMouseEvents() {
        this.$leafParent.on("mouseenter", (ev) => {
            this.r.currentTranslateText$.next(this.leafText);
        });
    }

    private applySingleElementMouseEvents(annotationElement: IAnnotatedCharacter, maxWord: IPositionedWord, i: number) {
        annotationElement.el.on("mouseenter", (ev) => {
            this.r.m.highlightedWord$.next(maxWord.word);
        });
        annotationElement.el.on('mouseleave', (ev) => {
            this.r.m.highlightedWord$.next();
        })
        annotationElement.el.on("click", (ev) => {
            this.$leafParent.children('.highlighted').removeClass('highlighted')
            this.r.m.requestEditWord$.next(maxWord.word);
        })
        return i;
    }
}