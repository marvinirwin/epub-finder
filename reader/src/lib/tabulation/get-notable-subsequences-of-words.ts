import {SegmentSubsequences} from "languagetrainer-server/src/shared";
import {subSequenceRecordHasNothingAdjacent} from "../schedule/learning-target/flash-card-learning-targets.service";

export const getNotableSubsequencesOfWords = (notableSubSequences: SegmentSubsequences, syntheticWords: Set<string>, strategy: 'noSeparator' | 'spaceSeparator', vocabulary: Set<string>): SegmentSubsequences => {
    const iPositionedWords = notableSubSequences
        .subsequences.filter((notableSubSequence, subSequenceIndex) => {
            if (syntheticWords.has(notableSubSequence.word)) {
                return false
            }
            switch (strategy) {
                case 'noSeparator':
                    return vocabulary.has(notableSubSequence.word)
                case 'spaceSeparator':
                    return vocabulary.has(notableSubSequence.word) ||
                        subSequenceRecordHasNothingAdjacent(notableSubSequences, notableSubSequence)
            }
        });

    return {
        segmentText: notableSubSequences.segmentText,
        subsequences: iPositionedWords
    };
}