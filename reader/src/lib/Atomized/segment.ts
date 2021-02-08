import {ITrie} from "../Interfaces/Trie";
import {Dictionary, flatten, uniq} from "lodash";
import {AtomMetadata} from "../Interfaces/atom-metadata.interface.ts/atom-metadata";
import {IWordInProgress} from "../Interfaces/Annotation/IWordInProgress";
import {IPositionedWord} from "../Interfaces/Annotation/IPositionedWord";
import {AtomizedDocument} from "./atomized-document";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {ReplaySubject} from "rxjs";
import {TabulatedSentences} from "./tabulated-documents.interface";
import {safePushSet} from "../../services/safe-push";

export class Segment {
    private _translation: string | undefined;
    private _previousWords = new Set<string>();
    public _popperInstance: any;
    public newWords$ = new ReplaySubject<Set<string>>(1);

    public static tabulateSentences(segments: Segment[], trie: ITrie, trieElementSizes: number[]): TabulatedSentences {
        return Segment.tabulate(
            trie,
            trieElementSizes,
            segments,
            c => !isChineseCharacter(c)
        )
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

    public static tabulate(
        t: ITrie,
        uniqueLengths: number[],
        segments: Segment[],
        characterFilterFunc: (c: string) => boolean
    ): TabulatedSentences {
        const elementSegmentMap = new Map<XMLDocumentNode, Segment>();
        const characterElements = flatten(segments.map(segment => {
            segment.children.forEach(node => elementSegmentMap.set(node, segment));
            return segment.children;
        })).filter(n => (n.textContent as string).trim());
        uniqueLengths = uniq(uniqueLengths.concat(1));
        const wordCounts: Dictionary<number> = {};
        const wordElementsMap: Dictionary<AtomMetadata[]> = {};
        const wordSegmentMap: Dictionary<Set<Segment>> = {};
        const atomMetadatas = new Map<XMLDocumentNode, AtomMetadata>();
        let wordsInProgress: IWordInProgress[] = [];
        const textContent = characterElements.map(node => node.textContent).join('');
        for (let i = 0; i < characterElements.length; i++) {
            const currentMark = characterElements[i] as unknown as XMLDocumentNode;
            wordsInProgress = wordsInProgress.map(w => {
                w.lengthRemaining--;
                return w;
            }).filter(w => w.lengthRemaining > 0);
            const potentialWords = uniq(uniqueLengths.map(size => textContent.substr(i, size)));
            const wordsWhichStartHere: string[] = potentialWords.reduce((acc: string[], potentialWord) => {
                if (t.hasWord(potentialWord)) {
                    safePushSet(wordSegmentMap, potentialWord, elementSegmentMap.get(currentMark))
                    acc.push(potentialWord);
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
                wordsWhichStartHere.push(currentCharacter);
            }

            wordsInProgress.push(...wordsWhichStartHere.map(word => {
                // Side effects bad
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
                return newPositionedWord;
            });

            const atomMetadata = new AtomMetadata({
                char: (textContent as string)[i],
                words,
                element: currentMark,
                i,
                parent: elementSegmentMap.get(currentMark) as Segment
            });
            atomMetadatas.set(currentMark, atomMetadata);
            atomMetadata.words.forEach(word => {
                if (wordElementsMap[word.word]) {
                    wordElementsMap[word.word].push(atomMetadata);
                } else {
                    wordElementsMap[word.word] = [atomMetadata]
                }
            })
        }
        const segmentDictionary: Dictionary<Segment[]> = Object.fromEntries(
            Object.entries(wordSegmentMap)
                .map(([word, segmentSet]) => [word, Array.from(segmentSet)])
        );
        console.log(segmentDictionary);
        return {
            wordElementsMap,
            wordCounts,
            wordSegmentMap: segmentDictionary,
            segments,
            atomMetadatas
        } as TabulatedSentences;
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

    get children(): XMLDocumentNode[] {
        return Array.from(this.element.childNodes);
    }
}
