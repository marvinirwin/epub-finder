import {SerializedSegment, tabulationFactory, TabulationParameters} from "../../tabulation/tabulate";
import {TabulatedSegments} from "../tabulated-documents.interface";
import {XMLDocumentNode} from "../../XMLDocumentNode";
import {flatten, uniq} from "lodash";
import {IWordInProgress} from "../../Annotation/IWordInProgress";
import {safePush, safePushMap} from "../../safe-push";
import {IPositionedWord} from "../../Annotation/IPositionedWord";
import {AtomMetadata} from "../../atom-metadata.interface.ts/atom-metadata";
import {Segment} from "./segment";
import {SegmentSubsequences} from "../../index";

export const textFromPositionedWordsAndAllText = (allText: string, positionedWords: IPositionedWord[]): string => {
    const startPoint = Math.min(...positionedWords.map(({position}) => position));
    const endPoint = Math.min(...positionedWords.map(({position, word}) => position + word.length));
    return allText.substr(startPoint, endPoint);
}

export const tabulate = ({
                             notableCharacterSequences,
                             segments,
                             isNotableCharacterRegex,
                             wordIdentifyingStrategy,
                             isWordBoundaryRegex,
                         }: TabulationParameters): TabulatedSegments => {
    const tabulationObject = tabulationFactory();
    const elementSegmentMap = new Map<XMLDocumentNode, Segment>();
    const isNotableCharacter = (character: string) =>
        isNotableCharacterRegex.test(character);
    const {
        wordSegmentMap,
        segmentWordCountRecordsMap,
        atomMetadatas,
        wordElementsMap,
    } = tabulationObject;

    const allMarks = flatten(
        segments.map((segment) => {
            segment.children.forEach((node) =>
                elementSegmentMap.set(node, segment),
            );
            return segment.children;
        }),
    ).filter((n) => {
        if (wordIdentifyingStrategy === "noSeparator") {
            return n.textContent.trim();
        }
        return n.textContent;
    });
    const uniqueLengths = uniq(
        Array.from(notableCharacterSequences.uniqueLengths).concat(1),
    );
    const textContent = allMarks
        .map((node) => node.textContent)
        .join("");
    let notableSubsequencesInProgress: IWordInProgress[] = [];
    let currentSegment: Segment;
    let segmentIndex = -1;
    let currentSegmentStart;
    let currentSerialzedSegment;
    for (let i = 0; i < allMarks.length; i++) {
        const currentMark = allMarks[i];
        const currentCharacter = textContent[i];
        if (elementSegmentMap.get(currentMark) !== currentSegment) {
            currentSegment = elementSegmentMap.get(currentMark);
            segmentIndex++;
            currentSegmentStart = i;
            currentSerialzedSegment = {
                text: currentSegment.translatableText,
                index: segmentIndex,
            };
            tabulationObject.notableSubSequences.push({
                segmentText: currentSegment.translatableText,
                subsequences: []
            })
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
        const notableSequencesWhichStartHere: string[] = potentialNotableSequences.reduce(
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

        if (
            notableSequencesWhichStartHere.length === 0 &&
            notableSubsequencesInProgress.length === 0 &&
            isNotableCharacter(currentCharacter)
        ) {
            switch (wordIdentifyingStrategy) {
                case "noSeparator":
                    notableSequencesWhichStartHere.push(currentCharacter);
                    break;
                case "spaceSeparator":
                    // Go until the next space or punctuation
                    const strings = textContent
                        .substr(i)
                        .split(isWordBoundaryRegex);
                    const wordStartingHere = strings[0];
                    if (wordStartingHere.trim()) {
                        safePush(wordSegmentMap, wordStartingHere, elementSegmentMap.get(currentMark));
                        wordStartingHereSplitBySeparator = wordStartingHere;
                        notableSequencesWhichStartHere.push(wordStartingHere);
                    }
                    break;
            }
        }

        notableSequencesWhichStartHere.forEach((wordStartingHere) => {
            tabulationObject.notableSubSequences[tabulationObject[tabulationObject.notableSubSequences.length - 1]]
                .subsequences.push({position: i, word: wordStartingHere});
            safePushMap(
                segmentWordCountRecordsMap,
                currentSerialzedSegment as SerializedSegment,
                {
                    position: i - currentSegmentStart,
                    word: wordStartingHere,
                },
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
        const words: SegmentSubsequences = {
            segmentText: textFromPositionedWordsAndAllText(currentSerialzedSegment.text, positionedWordsInProgress),
            subsequences: positionedWordsInProgress
        };

        const atomMetadata = new AtomMetadata({
            char: textContent[i],
            words,
            element: currentMark,
            i,
            parent: elementSegmentMap.get(currentMark),
        });
        atomMetadatas.set(currentMark, atomMetadata);
        atomMetadata.words.subsequences.forEach((word) => {
            if (wordElementsMap[word.word]) {
                wordElementsMap[word.word].push(atomMetadata);
            } else {
                wordElementsMap[word.word] = [atomMetadata];
            }
        });
    }
    tabulationObject.wordSegmentMap = Object.fromEntries(
        Object.entries(wordSegmentMap).map(([word, segmentSet]) => [
            word,
            Array.from(segmentSet),
        ]),
    );
    tabulationObject.wordSegmentStringsMap = new Map(
        Object.entries(
            tabulationObject.wordSegmentMap,
        ).map(([word, segments]) => [
            word,
            new Set(segments.map((segment) => segmentWordCountRecordsMap[segment.translatableText])),
        ]),
    );
    return tabulationObject;
};
