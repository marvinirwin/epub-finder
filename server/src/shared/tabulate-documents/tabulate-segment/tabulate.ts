import {
    SerializedSegment,
    tabulationFactory,
    TabulationParameters,
    WordSplitFunction
} from "../../tabulation/tabulate-types";
import {TabulatedSegments} from "../tabulated-documents.interface";
import {uniq} from "lodash";
import {safePush, safePushMap} from "../../safe-push";
import {IPositionedWord} from "../../annotation/IPositionedWord";
import {AtomMetadata} from "../../atom-metadata/atom-metadata";
import {SegmentSubsequences, wordBoundaryRegexp} from "../../index";
import {IWordInProgress} from "../../annotation/IWordInProgress";
// @ts-ignore
import memoize from "memoizee";
import {breakThaiWords} from "./breakThaiWords";
import {AbstractSegment} from "./abstractSegment";
import {AbstractNode} from "./abstractNode";
import {textFromPositionedWordsAndAllText} from "./textFromPositionedWordsAndAllText";
import {getTryAndUseFirstSplitWordFunction} from "./getTryAndUseFirstSplitWordFunction";
import {getWordSegmentSubsequencesMap} from "./getWordSegmentSubsequencesMap";
import {getWordSegmentMap} from "./getWordSegmentMap";
import {getAllMarks} from "./getAllMarks";

const processSegment = async <T extends AbstractSegment<any>>(segment: T, language_code: string, wordSplitFunction: WordSplitFunction) => {
    const result = await wordSplitFunction({
        language_code,
        text: segment.translatableText
    });

    return result?.splitWords;
};

export const tabulate = async <NodeType extends AbstractNode, SegmentType extends AbstractSegment<NodeType>>(
    {
        notableCharacterSequences,
        segments,
        isNotableCharacterRegex,
        wordIdentifyingStrategy,
        isWordBoundaryRegex,
        wordSplitFunction,
        language_code
    }: TabulationParameters<SegmentType>): Promise<TabulatedSegments<NodeType, SegmentType>> => {
    const tabulationObject = tabulationFactory<SegmentType, NodeType>();
    const elementSegmentMap = new Map<NodeType, SegmentType>();
    const isNotableCharacter = (character: string) =>
        isNotableCharacterRegex.test(character);
    const wordSegmentSubsequencesMap = new Map<string, SegmentSubsequences[]>();
    const {
        wordSegmentMap,
        segmentWordCountRecordsMap,
        wordElementsMap,
        notableSubSequences
    } = tabulationObject;


    const allMarks: NodeType[] = getAllMarks(segments, elementSegmentMap, wordIdentifyingStrategy);
    const uniqueLengths = uniq(
        Array.from(notableCharacterSequences.uniqueLengths).concat(1),
    );
    const textContent = allMarks
        .map((node) => node.textContent)
        .join("");
    let notableSubsequencesInProgress: IWordInProgress[] = [];
    let currentSegment: SegmentType | undefined;
    let segmentIndex = -1;
    let currentSegmentStart: number;
    let currentSerializedSegment: {
        text: string;
        index: number;
    } = {text: "", index: 0};
    /**
     * Every time a new segment is encountered, try to split it with the given function
     * If the function does not exist, or returned something bad, then do manual word entering
     */
    let splitFunctionResults: IPositionedWord[] | undefined = undefined

    const segmentPromises = await Promise.all(

        wordSplitFunction ? segments.map(segment => {
                return processSegment(segment, language_code, wordSplitFunction);
            }
        ) : []
    );

    for (let i = 0; i < allMarks.length; i++) {
        const currentMark: NodeType = allMarks[i];
        const currentCharacter = textContent[i];
        if (elementSegmentMap.get(currentMark) !== currentSegment) {
            currentSegment = elementSegmentMap.get(currentMark) as SegmentType;
            segmentIndex++;
            currentSegmentStart = i;
            currentSerializedSegment = {
                text: currentSegment.translatableText,
                index: segmentIndex,
            };
            splitFunctionResults = segmentPromises[segmentIndex];/*(wordSplitFunction ? await wordSplitFunction(
                {
                    language_code,
                    text: currentSegment.translatableText
                }
            ) : undefined)?.splitWords;*/
            const segmentSubSequences = {
                segmentText: currentSegment.translatableText,
                subsequences: []
            };
            safePushMap(wordSegmentSubsequencesMap, segmentSubSequences.segmentText, segmentSubSequences);
            notableSubSequences.push(segmentSubSequences);

        }

        notableSubsequencesInProgress = notableSubsequencesInProgress
            .map((w) => {
                w.lengthRemaining--;
                return w;
            })
            .filter((w) => w.lengthRemaining > 0);
        const potentialNotableSequences = uniq(
            uniqueLengths.map((size) => textContent.substr(i, size)),
        );
        const notableSequencesWhichStartHere: string[] = splitFunctionResults ?
            splitFunctionResults.filter(splitFunctionResult => splitFunctionResult.position === i).map(({word}) => word) :
            potentialNotableSequences.reduce(
                (acc: string[], potentialWord) => {
                    if (notableCharacterSequences.has(potentialWord)) {
                        safePush(
                            wordSegmentMap,
                            potentialWord,
                            elementSegmentMap.get(currentMark),
                        );
                        acc.push(potentialWord);
                    }
                    return acc;
                },
                [],
            );

        let wordStartingHereSplitBySeparator: string | undefined;

        if (notableSequencesWhichStartHere.length === 0) {
            if (notableSubsequencesInProgress.length === 0) {
                if (isNotableCharacter(currentCharacter)) {
                    const textContentPastThisPoint = textContent
                        .substr(i, textContent.length);
                    const tryAndUseFirstSplitWord = getTryAndUseFirstSplitWordFunction(elementSegmentMap, allMarks, i, wordSegmentMap, currentMark, notableSequencesWhichStartHere);
                    switch (wordIdentifyingStrategy) {
                        case "noSeparator":
                            notableSequencesWhichStartHere.push(currentCharacter);
                            break;
                        case "spaceSeparator":
                            // Go until the next space or punctuation
                            wordStartingHereSplitBySeparator = tryAndUseFirstSplitWord(textContentPastThisPoint.split(wordBoundaryRegexp));
                            break;
                        case "thai":
                            wordStartingHereSplitBySeparator = tryAndUseFirstSplitWord(await breakThaiWords(textContentPastThisPoint));
                            break;

                    }
                }
            }
        }


        notableSequencesWhichStartHere.forEach((wordStartingHere) => {
            const mostRecentSegmentSubsequence = notableSubSequences[notableSubSequences.length - 1];
            mostRecentSegmentSubsequence
                .subsequences.push({position: i, word: wordStartingHere});
            safePushMap(
                segmentWordCountRecordsMap,
                currentSerializedSegment as SerializedSegment,
                {
                    position: i - currentSegmentStart,
                    word: wordStartingHere,
                },
            );
            safePushMap(
                wordSegmentSubsequencesMap,
                wordStartingHere,
                mostRecentSegmentSubsequence
            );
        });

        notableSubsequencesInProgress.push(
            ...notableSequencesWhichStartHere.map((word) => {
                return {word, lengthRemaining: word.length};
            }),
        );
        // Positioned words, what's this for?
        const positionedWordsInProgress = notableSubsequencesInProgress.map(
            ({word, lengthRemaining}) => {
                return {
                    word,
                    position: word.length - lengthRemaining,
                };
            },
        );
        const segmentSubsequences: SegmentSubsequences = {
            segmentText: textFromPositionedWordsAndAllText(currentSerializedSegment.text, positionedWordsInProgress),
            subsequences: positionedWordsInProgress
        };

        const atomMetadata = new AtomMetadata<NodeType, SegmentType>({
            char: textContent[i],
            words: segmentSubsequences,
            element: currentMark,
            i,
            parent: elementSegmentMap.get(currentMark) as SegmentType,
        });
        tabulationObject.atomMetadatas.set(currentMark, atomMetadata);
        atomMetadata.words.subsequences.forEach((word) => {
            if (wordElementsMap[word.word]) {
                wordElementsMap[word.word].push(atomMetadata);
            } else {
                wordElementsMap[word.word] = [atomMetadata];
            }
        });
    }
    tabulationObject.wordSegmentMap = getWordSegmentMap(wordSegmentMap);
    tabulationObject.wordSegmentSubSequencesMap = getWordSegmentSubsequencesMap(tabulationObject, wordSegmentSubsequencesMap);
    return tabulationObject;
};
