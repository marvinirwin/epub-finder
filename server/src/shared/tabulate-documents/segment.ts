import {Dictionary, flatten, uniq} from "lodash";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {IWordInProgress} from "../Annotation/IWordInProgress";
import {IPositionedWord} from "../Annotation/IPositionedWord";
import {AtomizedDocument} from "./atomized-document";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {isChineseCharacter} from "../OldAnkiClasses/Card";
import {TabulatedSentences} from "./tabulated-documents.interface";
import {safePushSet} from "../safe-push";
import {SetWithUniqueLengths} from "./set-with-unique-lengths";

export class Segment {
    _translation: string | undefined;
    _popperInstance: any;
    translatableText: string;
    popperElement: XMLDocumentNode;
    translated = false;
    element: XMLDocumentNode;

    constructor(
        element: XMLDocumentNode
    ) {
        this.element = element;
        this.translatableText = this.element.textContent || '';
        // @ts-ignore
        this.popperElement = element.ownerDocument
            .getElementById(
                AtomizedDocument.getPopperId(
                    this.element.getAttribute('popper-id')
                )
            );
    }

    static tabulate(
        t: SetWithUniqueLengths,
        segments: Segment[],
    ): TabulatedSentences {
        const elementSegmentMap = new Map<XMLDocumentNode, Segment>();
        const characterElements = flatten(segments.map(segment => {
            segment.children.forEach(node => elementSegmentMap.set(node, segment));
            return segment.children;
        })).filter(n => (n.textContent).trim());
        const uniqueLengths = uniq(Array.from(t.uniqueLengths).concat(1));
        const wordCounts: Dictionary<number> = {};
        const wordElementsMap: Dictionary<AtomMetadata[]> = {};
        const wordSegmentMap: Dictionary<Set<Segment>> = {};
        const atomMetadatas = new Map<XMLDocumentNode, AtomMetadata>();
        let wordsInProgress: IWordInProgress[] = [];
        const textContent = characterElements.map(node => node.textContent).join('');
        for (let i = 0; i < characterElements.length; i++) {
            const currentMark = characterElements[i];
            wordsInProgress = wordsInProgress.map(w => {
                w.lengthRemaining--;
                return w;
            }).filter(w => w.lengthRemaining > 0);
            const potentialWords = uniq(uniqueLengths.map(size => textContent.substr(i, size)));
            const wordsWhichStartHere: string[] = potentialWords.reduce((acc: string[], potentialWord) => {
                if (t.has(potentialWord)) {
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
                char: (textContent)[i],
                words,
                element: currentMark,
                i,
                parent: elementSegmentMap.get(currentMark)
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
        return {
            wordElementsMap,
            wordCounts,
            wordSegmentMap: segmentDictionary,
            segments,
            atomMetadatas,
            wordSegmentStringsMap: new Map(Object.entries(segmentDictionary).map(([word, segments]) => [word, new Set(segments.map(segment => segment.translatableText))]))
        };
    }

    getSentenceHTMLElement(): HTMLElement {
        // @ts-ignore
        return this.element;
    }

    getPopperHTMLElement(): HTMLElement {
        // @ts-ignore
        return this.popperElement;
    }

    async getTranslation(): Promise<string> {
        if (this.translated) {
            return this._translation;
        } else {
            this.translated = true;
            return this.translatableText;
        }
    }

    destroy() {
        this.element.parentNode.removeChild(this.element);
        this.popperElement.parentNode.removeChild(this.popperElement);
    }

    showPopper() {
        this.getPopperHTMLElement().setAttribute('data-show', '');
    }

    hidePopper() {
        const v = this._popperInstance?.destroy()
        const t = this.getPopperHTMLElement().removeAttribute('data-show');
    }

    get children(): XMLDocumentNode[] {
        return Array.from(this.element.childNodes);
    }
}
