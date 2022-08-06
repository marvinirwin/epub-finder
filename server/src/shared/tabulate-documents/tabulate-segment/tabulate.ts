import {SerializedSegment, tabulationFactory, TabulationParameters} from "../../tabulation/tabulate-types";
import {TabulatedSegments} from "../tabulated-documents.interface";
import {flatten, uniq} from "lodash";
import {safePush, safePushMap} from "../../safe-push";
import {IPositionedWord} from "../../annotation/IPositionedWord";
import {AtomMetadata} from "../../atom-metadata/atom-metadata";
import {SegmentSubsequences, wordBoundaryRegexp} from "../../index";
import {IWordInProgress} from "../../annotation/IWordInProgress";
// @ts-ignore
import memoize from "memoizee";
import {breakThaiWords} from "./breakThaiWords";


export const textFromPositionedWordsAndAllText = (allText: string, positionedWords: IPositionedWord[]): string => {
  const startPoint = Math.min(...positionedWords.map(({position}) => position));
  const endPoint = Math.min(...positionedWords.map(({position, word}) => position + word.length));
  return allText.substr(startPoint, endPoint);
};

export type AbstractNode = {
  textContent: string | null;
}

export type AbstractSegment<T extends AbstractNode> = {
  children: T[];
  textContent: string | null;
  translatableText: string;
};

export const tabulate = async <NodeType extends AbstractNode, SegmentType extends AbstractSegment<NodeType>>(
  {
    notableCharacterSequences,
    segments,
    isNotableCharacterRegex,
    wordIdentifyingStrategy,
    isWordBoundaryRegex,
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


  const allMarks: NodeType[] = flatten(
    segments.map((segment) => {
      segment.children.forEach((node) =>
        elementSegmentMap.set(node, segment),
      );
      return segment.children;
    }),
  ).filter((n) => {
    const text = n.textContent as string;
    if (wordIdentifyingStrategy === "noSeparator") {
      return text.trim();
    }
    return text;
  });
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
  let currentSerialzedSegment: {
    text: string;
    index: number;
  } = {text: "", index: 0};


  for (let i = 0; i < allMarks.length; i++) {
    const currentMark: NodeType = allMarks[i];
    const currentCharacter = textContent[i];
    if (elementSegmentMap.get(currentMark) !== currentSegment) {
      currentSegment = elementSegmentMap.get(currentMark) as SegmentType;
      segmentIndex++;
      currentSegmentStart = i;
      currentSerialzedSegment = {
        text: currentSegment.translatableText,
        index: segmentIndex,
      };
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

    if (notableSequencesWhichStartHere.length === 0) {
      if (notableSubsequencesInProgress.length === 0) {
        if (isNotableCharacter(currentCharacter)) {
          const textContentPastThisPoint = textContent
            .substr(i, textContent.length);

          const tryAndUseFirstSplitWord = <NodeType>(strings: string[]) => {
            const wordStartingHere = strings[0]?.trim();
            if (wordStartingHere) {
              // Don't include if this word is part of multiple segments
              const segmentsThisWordIsAPartOf = new Set(wordStartingHere
                .split("")
                .map((letter, index) => elementSegmentMap.get(allMarks[i + index])));
              if (segmentsThisWordIsAPartOf.size > 1) {
                return ""
              }
              safePush(wordSegmentMap, wordStartingHere, elementSegmentMap.get(currentMark));
              notableSequencesWhichStartHere.push(wordStartingHere);
              return wordStartingHere;
            }
          };

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
        currentSerialzedSegment as SerializedSegment,
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
      segmentText: textFromPositionedWordsAndAllText(currentSerialzedSegment.text, positionedWordsInProgress),
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
  tabulationObject.wordSegmentMap = Object.fromEntries(
    Object.entries(wordSegmentMap).map(([word, segmentSet]) => [
      word,
      Array.from(segmentSet),
    ]),
  );
  tabulationObject.wordSegmentSubSequencesMap = new Map(
    Object.entries(
      tabulationObject.wordSegmentMap,
    ).map(([word]) => {
      return [
        word,
        new Set(wordSegmentSubsequencesMap.get(word) as SegmentSubsequences[]),
      ];
    }),
  );
  return tabulationObject;
};
