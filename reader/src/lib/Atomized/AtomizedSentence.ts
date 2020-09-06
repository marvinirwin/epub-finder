import {ITrie} from "../Interfaces/Trie";
import {Dictionary, maxBy, uniq} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../Interfaces/Annotation/IWordInProgress";
import {IPositionedWord} from "../Interfaces/Annotation/IPositionedWord";
import {AtomizedDocument} from "./AtomizedDocument";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {mergeSentenceInfo, TextWordData} from "./TextWordData";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {getTranslation} from "../Util/Util";
import {ReplaySubject} from "rxjs";

export class AtomizedSentence {
    private _translation: string | undefined;
    private _previousWords = new Set<string>();
    public newWords$ = new ReplaySubject<Set<string>>(1);

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
        uniqueLengths = uniq(uniqueLengths.concat(1));
        const wordCounts: Dictionary<number> = {};
        const wordElementsMap: Dictionary<IAnnotatedCharacter[]> = {};
        const wordSentenceMap: Dictionary<AtomizedSentence[]> = {};
        const newWords = new Set<string>();
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
                if (t.hasWord(str) || (str.length === 1 && isChineseCharacter(str))) {
                    acc.push(str);
                    wordSentenceMap[str] = [this];
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
                let position = word.length - lengthRemaining;
                let newPositionedWord: IPositionedWord = {
                    word,
                    position: position
                };
                if (!this._previousWords.has(word)) {
                    newWords.add(word);
                }
                this._previousWords.add(`${word}`);
                return newPositionedWord;
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
        const sentenceMap: Dictionary<AtomizedSentence[]> = {
            [this.translatableText]: [this]
        };
        if (newWords.size) {
            this.newWords$.next(newWords);
        }
        return {
            wordElementsMap,
            wordCounts,
            wordSentenceMap,
            sentenceMap
        };
    }

    getSentenceHTMLElement(): HTMLElement {
        return this.sentenceElement as unknown as HTMLElement;
    }

    getPopperHTMLElement(): HTMLElement {
        return this.popperElement as unknown as HTMLElement;
    }

    async getTranslation(): Promise<string> {
        if (this.translated) {
            return this._translation as string;
        } else {
            const t = await getTranslation(this.sentenceElement.textContent)
            this.translated = true;
            this.popperElement.textContent = t;
            return this.translatableText;
        }
    }

    public destroy() {
        this.sentenceElement.parentNode.removeChild(this.sentenceElement);
        this.popperElement.parentNode.removeChild(this.popperElement);
    }
}
