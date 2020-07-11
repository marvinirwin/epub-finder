import {ITrie} from "../Interfaces/Trie";
import {Dictionary, maxBy} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../Interfaces/Annotation/IWordInProgress";
import {IPositionedWord} from "../Interfaces/Annotation/IPositionedWord";
import {AtomizedDocument} from "./AtomizedDocument";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {mergeSentenceInfo, TextWordData} from "./TextWordData";

export class AtomizedSentence {

    public static getTextWordData(atomizedSentences: AtomizedSentence[], trie: ITrie, trieElementSizes: number[]): TextWordData {
        let textWordDataRecords = atomizedSentences.map(atomizedSentence =>
            atomizedSentence.getTextWordData(trie, trieElementSizes)
        );
        return mergeSentenceInfo(...textWordDataRecords);
    }

    translatableText: string;
    popperElement: XMLDocumentNode;
    translated = false;

    constructor(
        public sentenceElement: XMLDocumentNode
    ) {
        this.translatableText = this.sentenceElement.textContent || '';
        this.popperElement = (sentenceElement.ownerDocument as XMLDocument)
            .getElementById(
                AtomizedDocument.getPopperId(
                    this.sentenceElement.getAttribute('popper-id') as string
                )
            ) as unknown as XMLDocumentNode;
    }

    getTextWordData(t: ITrie, uniqueLengths: number[]): TextWordData {
        const wordCounts: Dictionary<number> = {};
        const wordElementsMap: Dictionary<IAnnotatedCharacter[]> = {};
        let wordsInProgress: IWordInProgress[] = [];
        let children = this.sentenceElement.childNodes;
        for (let i = 0; i < children.length; i++) {
            const currentMark = children[i] as unknown as XMLDocumentNode;
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
            wordsInProgress.push(...wordsWhichStartHere.map(word => {
                if (wordCounts[word]) {
                    wordCounts[word]++;
                } else {
                    wordCounts[word] = 1;
                }
                return ({word, lengthRemaining: word.length});
            }))

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
                el: currentMark,
                maxWord,
                i,
                parent: this
            };

            annotationElement.words.forEach(w => {
                if (wordElementsMap[w.word]) {
                    wordElementsMap[w.word].push(annotationElement);
                } else {
                    wordElementsMap[w.word] = [annotationElement]
                }
            })
        }
        return {wordElementsMap, wordCounts};
    }

    getSentenceHTMLElement(): HTMLElement {
        return this.sentenceElement as unknown as HTMLElement;
    }

    getPopperHTMLElement(): HTMLElement {
        return this.popperElement as unknown as HTMLElement;
    }

}
