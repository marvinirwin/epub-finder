import {ITrie} from "../../Interfaces/Trie";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../../Interfaces/Annotation/IWordInProgress";
import {maxBy, Dictionary} from "lodash";
import $ from "jquery";
import {PageRenderer} from "./PageRenderer";
import {IPositionedWord} from "../../Interfaces/Annotation/IPositionedWord";
import {ReaderDocument} from "./ReaderDocument";
import {getTranslation} from "../../Manager";

export class AnnotatedElement {
    private translatableText: string;
    popperElement: HTMLElement;
    private translated = false;

    constructor(
        public r: PageRenderer,
        public leafParent: HTMLElement
    ) {

        this.applyParentMouseEvents();
        this.translatableText = leafParent.getAttribute('translatable-text') as string;
        this.popperElement = (leafParent.ownerDocument as XMLDocument)
            .getElementById(ReaderDocument.getPopperId(
                this.leafParent.getAttribute('popper-id') as string
                )
            ) as HTMLElement;
    }

    updateWords(t: ITrie, uniqueLengths: number[]): Dictionary<IAnnotatedCharacter[]> {
        const elsMappedToWords: Dictionary<IAnnotatedCharacter[]> = {};
        let wordsInProgress: IWordInProgress[] = [];
        let children = this.leafParent.children;
        const text = this.leafParent.textContent as string;
        for (let i = 0; i < children.length; i++) {
            const currentMark = children[i] as HTMLElement;
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
            let annotationElement: IAnnotatedCharacter = {
                char: text[i],
                words: words,
                el: currentMark
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
        this.leafParent.onmouseenter = (ev) => {
            if (!this.translated) {
                getTranslation(this.leafParent).then(t => {
                    this.translated = true;
                    return this.popperElement.textContent = t;
                })
            }
        };
    }

    private applySingleElementMouseEvents(annotationElement: IAnnotatedCharacter, maxWord: IPositionedWord, i: number) {
        annotationElement.el.onmouseenter = (ev) => {
            this.r.m.highlightedWord$.next(maxWord.word);
        };
        annotationElement.el.onmouseleave = (ev) => {
            this.r.m.highlightedWord$.next();
        }
        annotationElement.el.onclick = (ev) => {
            const children = this.leafParent.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                child.classList.remove('highlighted')
            }
            this.r.m.requestEditWord$.next(maxWord.word);
        };
        return i;
    }
}