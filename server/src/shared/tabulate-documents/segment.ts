import {Dictionary, flatten, uniq, maxBy} from "lodash";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {IWordInProgress} from "../Annotation/IWordInProgress";
import {IPositionedWord} from "../Annotation/IPositionedWord";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {isChineseCharacter} from "../OldAnkiClasses/Card";
import {TabulatedSegments} from "./tabulated-documents.interface";
import {safePush, safePushMap, safePushSet} from "../safe-push";
import {TabulationParameters, tabulationFactory, WordCountRecord} from "../tabulation/tabulate";


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
        {
            notableCharacterSequences,
            segments,
            greedyWordSet
        }: TabulationParameters
    ): TabulatedSegments {
        const tabulationObject = tabulationFactory();
        const elementSegmentMap = new Map<XMLDocumentNode, Segment>();
        const {
            greedyWordCounts,
            wordSegmentMap,
            wordSegmentStringsMap,
            segmentWordCountRecordsMap,
            wordCounts,
            atomMetadatas,
            wordElementsMap,
            greedyDocumentWordCounts
        } = tabulationObject

        const characterElements = flatten(segments.map(segment => {
            segment.children.forEach(node => elementSegmentMap.set(node, segment));
            return segment.children;
        })).filter(n => (n.textContent).trim());
        const uniqueLengths = uniq(Array.from(notableCharacterSequences.uniqueLengths).concat(1));
        const textContent = characterElements.map(node => node.textContent).join('');
        let notableSubsequencesInProgress: IWordInProgress[] = [];
        let greedyWord: IWordInProgress | undefined;
        let currentSegment;
        let currentSegmentStart;
        for (let i = 0; i < characterElements.length; i++) {
            const currentMark = characterElements[i];
            currentSegmentStart++;
            if (elementSegmentMap.get(currentMark) !== currentSegment) {
                currentSegment = elementSegmentMap.get(currentMark);
                currentSegmentStart = i;
            }
            const newGreedyWord = () => {
                const chosenGreedyWord = maxBy(
                    notableSubsequencesInProgress.filter(wordInProgress => greedyWordSet.has(wordInProgress.word)),
                    wordInProgress => wordInProgress.word.length
                );
                if (chosenGreedyWord) {
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

            notableSubsequencesInProgress = notableSubsequencesInProgress.map(w => {
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
                if (notableCharacterSequences.has(potentialWord)) {
                    safePush(wordSegmentMap, potentialWord, elementSegmentMap.get(currentMark))
                    acc.push(potentialWord);
                }
                return acc;
            }, []);
            wordsWhichStartHere.forEach(wordStartingHere => {
                safePushMap(
                    segmentWordCountRecordsMap,
                    currentSegment as Segment,
                    {
                        position: i - currentSegmentStart,
                        word: wordStartingHere
                    }
                )
            })
            if (!greedyWord) {
                greedyWord = newGreedyWord();
            }
            const greedyWordHasEnded = !notableSubsequencesInProgress.includes(greedyWord);
            if (greedyWordHasEnded) {
                greedyWord = newGreedyWord()
            }

            /**
             * If there is a character here which isn't part of a word, add it to the counts
             * If this was a letter based language we would add unidentified words, but for character based languages
             * A single character is a word
             */
            const currentCharacter = textContent[i];
            if ((wordsWhichStartHere.length === 0 && notableSubsequencesInProgress.length === 0) && isChineseCharacter(currentCharacter)) {
                wordsWhichStartHere.push(currentCharacter);
            }

            notableSubsequencesInProgress.push(...wordsWhichStartHere.map(word => {
                // Side effects bad
                if (wordCounts[word]) {
                    wordCounts[word]++;
                } else {
                    wordCounts[word] = 1;
                }
                return ({word, lengthRemaining: word.length});
            }))

            // Positioned words, what's this for?
            const words: IPositionedWord[] = notableSubsequencesInProgress.map(({word, lengthRemaining}) => {
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
        tabulationObject.wordSegmentMap = Object.fromEntries(
            Object.entries(wordSegmentMap)
                .map(([word, segmentSet]) => [word, Array.from(segmentSet)])
        );
        tabulationObject.wordSegmentStringsMap = new Map(Object.entries(tabulationObject.wordSegmentMap).map(([word, segments]) => [word, new Set(segments.map(segment => segment.translatableText))]))
        return tabulationObject;
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
