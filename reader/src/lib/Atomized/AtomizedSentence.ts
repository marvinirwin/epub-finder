import {ITrie} from "../Interfaces/Trie";
import {Dictionary, maxBy, uniq} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {IWordInProgress} from "../Interfaces/Annotation/IWordInProgress";
import {IPositionedWord} from "../Interfaces/Annotation/IPositionedWord";
import {AtomizedDocument} from "./AtomizedDocument";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {mergeSentenceInfo, TextWordData} from "./TextWordData";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {ReplaySubject} from "rxjs";
import {fetchTranslation} from "../../services/translate.service";

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
        public element: XMLDocumentNode
    ) {
        this.translatableText = this.element.textContent || '';
        this.popperElement = (element.ownerDocument as XMLDocument)
            .getElementById(
                AtomizedDocument.getPopperId(
                    this.element.getAttribute('popper-id') as string
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
        let children = this.element.childNodes;
        let textContent = this.element.textContent as string;
        for (let i = 0; i < children.length; i++) {
            const currentMark = children[i] as unknown as XMLDocumentNode;
            wordsInProgress = wordsInProgress.map(w => {
                w.lengthRemaining--;
                return w;
            }).filter(w => w.lengthRemaining > 0);
            const potentialWords = uniq(uniqueLengths.map(size => textContent.substr(i, size)));
            const wordsWhichStartHere: string[] = potentialWords.reduce((acc: string[], potentialWord) => {
                if (t.hasWord(potentialWord)) {
                    acc.push(potentialWord);
                    wordSentenceMap[potentialWord] = [this];
                }
                return acc;
            }, []);

            /**
             * If there is a character here which isn't part of a word, add it to the counts
             * If this was a letter based language we would add unidentified words, but for character based languages
             * A single character is a word
             */
            const currentCharacter = textContent[i];
            if ((wordsWhichStartHere.length === 0 && wordsInProgress.length === 0) && isChineseCharacter(currentCharacter)) {
                wordSentenceMap[currentCharacter] = [this];
                wordsWhichStartHere.push(currentCharacter);
            }

            wordsInProgress.push(...wordsWhichStartHere.map(word => {
                if (wordCounts[word]) {
                    wordCounts[word]++;
                } else {
                    wordCounts[word] = 1;
                }
                return ({word, lengthRemaining: word.length});
            }))

            // Positioned words, what's this for?
            const words: IPositionedWord[] = wordsInProgress.map(({word, lengthRemaining}) => {
                const position = word.length - lengthRemaining;
                const newPositionedWord: IPositionedWord = {
                    word,
                    position: position
                };
                if (!this._previousWords.has(word)) {
                    newWords.add(word);
                }
                this._previousWords.add(word);
                return newPositionedWord;
            });

            /**
             * I'm trying to figure out why wordElementMap isn't populated with 中 when scanning the word 中共中央
             */
            const maxWord: IPositionedWord | undefined = maxBy(words, w => w.word.length);
            const annotationElement: IAnnotatedCharacter = {
                char: (textContent as string)[i],
                words: words,
                element: currentMark,
                maxWord,
                i,
                parent: this
            };
/*
            if (maxWord?.word === '中共中央' && currentCharacter === '中') {
            }
*/

            annotationElement.words.forEach(word => {
                if (wordElementsMap[word.word]) {
                    wordElementsMap[word.word].push(annotationElement);
                } else {
                    wordElementsMap[word.word] = [annotationElement]
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
        return this.element as unknown as HTMLElement;
    }

    getPopperHTMLElement(): HTMLElement {
        return this.popperElement as unknown as HTMLElement;
    }

    async getTranslation(): Promise<string> {
        if (this.translated) {
            return this._translation as string;
        } else {
            const translatedText = await fetchTranslation(this.translatableText)
            this.translated = true;
            this.popperElement.textContent = translatedText;
            return this.translatableText;
        }
    }

    public destroy() {
        this.element.parentNode.removeChild(this.element);
        this.popperElement.parentNode.removeChild(this.popperElement);
    }
}
