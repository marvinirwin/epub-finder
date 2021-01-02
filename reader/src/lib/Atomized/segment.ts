import {ITrie} from "../Interfaces/Trie";
import {Dictionary, maxBy, uniq} from "lodash";
import {AtomMetadata} from "../Interfaces/atom-metadata.interface.ts/atom-metadata";
import {IWordInProgress} from "../Interfaces/Annotation/IWordInProgress";
import {IPositionedWord} from "../Interfaces/Annotation/IPositionedWord";
import {AtomizedDocument} from "./atomized-document";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {mergeTabulations} from "./merge-tabulations";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {ReplaySubject} from "rxjs";
import {TabulatedDocuments, TabulatedSentences} from "./tabulated-documents.interface";

export class Segment {
    private _translation: string | undefined;
    private _previousWords = new Set<string>();
    public _popperInstance: any;
    public newWords$ = new ReplaySubject<Set<string>>(1);

    public static tabulateSentences(atomizedSentences: Segment[], trie: ITrie, trieElementSizes: number[]): TabulatedSentences {
        const textWordDataRecords = atomizedSentences.map(atomizedSentence =>
            atomizedSentence.tabulate(trie, trieElementSizes)
        );
        return mergeTabulations(...textWordDataRecords);
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

    tabulate(t: ITrie, uniqueLengths: number[]): TabulatedSentences {
        uniqueLengths = uniq(uniqueLengths.concat(1));
        const wordCounts: Dictionary<number> = {};
        const wordElementsMap: Dictionary<AtomMetadata[]> = {};
        const wordSentenceMap: Dictionary<Segment[]> = {};
        const atomMetadatas = new Map<XMLDocumentNode, AtomMetadata>();
        const newWords = new Set<string>();
        let wordsInProgress: IWordInProgress[] = [];
        const children = this.element.childNodes;
        const textContent = this.element.textContent as string;
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
                    position
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
            const atomMetadata: AtomMetadata = {
                char: (textContent as string)[i],
                words,
                element: currentMark,
                maxWord,
                i,
                parent: this
            };
            atomMetadatas.set(currentMark, atomMetadata);
            atomMetadata.words.forEach(word => {
                if (wordElementsMap[word.word]) {
                    wordElementsMap[word.word].push(atomMetadata);
                } else {
                    wordElementsMap[word.word] = [atomMetadata]
                }
            })
        }
        const sentenceMap: Dictionary<Segment[]> = {
            [this.translatableText]: [this]
        };
        if (newWords.size) {
            this.newWords$.next(newWords);
        }
        return {
            wordElementsMap,
            wordCounts,
            wordSentenceMap,
            segments: sentenceMap,
            atomMetadatas
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
            this.translated = true;
            return this.translatableText;
        }
    }

    public destroy() {
        this.element.parentNode.removeChild(this.element);
        this.popperElement.parentNode.removeChild(this.popperElement);
    }

    public showPopper() {
        this.getPopperHTMLElement().setAttribute('data-show', '');
    }

    public hidePopper() {
        this._popperInstance?.destroy()
        this.getPopperHTMLElement().removeAttribute('data-show');
    }

    get children() {
        return this.element.childNodes
    }
}
