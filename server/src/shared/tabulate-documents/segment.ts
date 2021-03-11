import {Dictionary, flatten, uniq, maxBy} from "lodash";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {IWordInProgress} from "../Annotation/IWordInProgress";
import {IPositionedWord} from "../Annotation/IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {isChineseCharacter} from "../OldAnkiClasses/Card";
import {TabulatedSentences} from "./tabulated-documents.interface";
import {safePushSet} from "../safe-push";
import {SetWithUniqueLengths} from "./set-with-unique-lengths";

export class Segment {
    _translation: string | undefined;
    translatableText: string;
    popperElement: XMLDocumentNode;
    translated = false;
    element: XMLDocumentNode;
    translationCb: (s: string) => void | undefined;

    constructor(
        element: XMLDocumentNode
    ) {
        this.element = element;
        this.translatableText = this.element.textContent || '';
    }

    static tabulate(
        t: SetWithUniqueLengths,
        segments: Segment[],
    ): TabulatedSentences {
        const greedyWordCounts = new Map<string, number>();
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
        let greedyWord: IWordInProgress | undefined;

        const newGreedyWord = () => {
            const chosenGreedyWord = maxBy(wordsInProgress, wordInProgress => wordInProgress.word.length);
            if (chosenGreedyWord){
                if (!greedyWordCounts.get(chosenGreedyWord.word)) {
                    greedyWordCounts.set(chosenGreedyWord.word, 0)
                }
                greedyWordCounts.set(
                    chosenGreedyWord.word,
                    greedyWordCounts.get(chosenGreedyWord.word) + 1
                );
            }
            return chosenGreedyWord;
        };

        for (let i = 0; i < characterElements.length; i++) {
            const currentMark = characterElements[i];
            wordsInProgress = wordsInProgress.map(w => {
                w.lengthRemaining--;
                return w;
            }).filter(w => w.lengthRemaining > 0);
            /**
             * One thing I could do which would be easy is to take the largest word in progress at any point
             * However, then I would have a hard time knowing when to end the word
             * How did I do this before?
             * I don't think I did it before, I think just I ignored all 1 character words if they were in progress
             * Can't I still do that?
             *
             * The easiest thing to visualize is getting to a character and then finding the largest word which starts where
             * Then add 1 to the count, and wait until that word expires before picking a new one
             * I'll have to store the start position so I know when it ends
             *
             * What's the algorithmic alternative to the greedy version above?
             * I could do what I did before and ignore one-character words, but that would generate an un-intuitive count
             *
             * I could also ignore words which are subsumed by other words, but obtain words which span two "greedy" words
             * For the "ignore-subsumed" approach I'll still have to calculate the max word in progress, so I should just do max word
             *
             * Would I be able to calculate these "maxWords", just by looking at each character?
             * I would take each character's maxWord, and then adjust the count when the maxWord changes
             * However, if there were two of the same maxWord in a row this would fail
             *
             * Alright, I'll do greedy for now
             *
             * I should have written tests for this
             */
            const potentialWords = uniq(uniqueLengths.map(size => textContent.substr(i, size)));
            const wordsWhichStartHere: string[] = potentialWords.reduce((acc: string[], potentialWord) => {
                if (t.has(potentialWord)) {
                    safePushSet(wordSegmentMap, potentialWord, elementSegmentMap.get(currentMark))
                    acc.push(potentialWord);
                }
                return acc;
            }, []);
            if (!greedyWord) {
                greedyWord = newGreedyWord();
            }
            const greedyWordHasEnded = !wordsInProgress.includes(greedyWord);
            if (greedyWordHasEnded) {
                greedyWord = newGreedyWord()
            }

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
            greedyWordCounts: greedyWordCounts,
            wordSegmentStringsMap: new Map(Object.entries(segmentDictionary).map(([word, segments]) => [word, new Set(segments.map(segment => segment.translatableText))])),
        };
    }

    getSentenceHTMLElement(): HTMLElement {
        // @ts-ignore
        return this.element;
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


    get children(): XMLDocumentNode[] {
        return Array.from(this.element.childNodes);
    }
}
