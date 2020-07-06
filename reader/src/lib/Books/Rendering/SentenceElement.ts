import {ITrie} from "../../Interfaces/Trie";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../../Interfaces/Annotation/IWordInProgress";
import {Dictionary, maxBy} from "lodash";
import {PageRenderer} from "./PageRenderer";
import {IPositionedWord} from "../../Interfaces/Annotation/IPositionedWord";
import {ReaderDocument} from "./ReaderDocument";
import {createPopper} from '@popperjs/core';


export class SentenceElement {
    translatableText: string;
    popperElement: HTMLElement;
    translated = false;

    constructor(
        public r: PageRenderer,
        public sentenceElement: HTMLElement
    ) {
        const showEvents = ['mouseenter', 'focus'];
        const hideEvents = ['mouseleave', 'blur'];

        this.r.m.applySentenceElementSelectListener(this);
        this.translatableText = sentenceElement.textContent as string;
        let attribute = this.sentenceElement.getAttribute('popper-id') as string;
        let popperId = ReaderDocument.getPopperId( attribute );
        this.popperElement = (sentenceElement.ownerDocument as XMLDocument).getElementById(popperId) as HTMLElement;
        createPopper(this.sentenceElement, this.popperElement, {
            placement: 'top',
        });

        const show = () => {
            this.popperElement.setAttribute('data-show', '');
        }
        const hide = () => {
            this.popperElement.removeAttribute('data-show');
        }

        showEvents.forEach(event => {
            sentenceElement.addEventListener(event, show);
        });

        hideEvents.forEach(event => {
            sentenceElement.addEventListener(event, hide);
        });
    }

    getWordElementMemberships(t: ITrie, uniqueLengths: number[]): Dictionary<IAnnotatedCharacter[]> {
        const wordElementsMap: Dictionary<IAnnotatedCharacter[]> = {};
        let wordsInProgress: IWordInProgress[] = [];
        let children = this.sentenceElement.children;
        for (let i = 0; i < children.length; i++) {
            const currentMark = children[i] as HTMLElement;
            wordsInProgress = wordsInProgress.map(w => {
                w.lengthRemaining--;
                return w;
            }).filter(w => w.lengthRemaining > 0);
            const stringChunks = uniqueLengths.map(size => (this.sentenceElement.textContent as string).substr(i, size));
            const wordsWhichStartHere: string[] = stringChunks.reduce((acc: string[], str) => {
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
                char: (this.sentenceElement.textContent as string)[i],
                words: words,
                el: currentMark
            };
            annotationElement.words.forEach(w => {
                if (wordElementsMap[w.word]) {
                    wordElementsMap[w.word].push(annotationElement);
                } else {
                    wordElementsMap[w.word] = [annotationElement]
                }
            })

            if (maxWord) {
                this.r.m.applyWordElementListener(annotationElement, maxWord, i, this);
            }
        }
        return wordElementsMap;
    }
}