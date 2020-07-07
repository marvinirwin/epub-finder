import {ITrie} from "../Interfaces/Trie";
import {Dictionary, maxBy} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../Interfaces/Annotation/IWordInProgress";
import {IPositionedWord} from "../Interfaces/Annotation/IPositionedWord";
import {AtomizedDocument} from "./AtomizedDocument";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";

export class AtomizedSentence {

    public static getWordElementMappings(atomizedSentences: AtomizedSentence[], trie: ITrie, trieElementSizes: number[]): Dictionary<IAnnotatedCharacter[]> {
        let wordElementsMaps = atomizedSentences.map(atomizedSentence =>
            atomizedSentence.getWordElementMemberships(trie, trieElementSizes)
        );
        return mergeDictArrays<IAnnotatedCharacter>(...wordElementsMaps);
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

    getWordElementMemberships(t: ITrie, uniqueLengths: number[]): Dictionary<IAnnotatedCharacter[]> {
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
                el: currentMark,
                maxWord
            };

            annotationElement.words.forEach(w => {
                if (wordElementsMap[w.word]) {
                    wordElementsMap[w.word].push(annotationElement);
                } else {
                    wordElementsMap[w.word] = [annotationElement]
                }
            })
        }
        return wordElementsMap;
    }

    getSentenceHTMLElement(): HTMLElement {
        return this.sentenceElement as unknown as HTMLElement;
    }

    getPopperHTMLElement(): HTMLElement {
        return this.popperElement as unknown as HTMLElement;
    }

}
