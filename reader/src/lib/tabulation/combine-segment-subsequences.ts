import {SegmentSubsequences} from "languagetrainer-server/src/shared";
import {flatten} from "lodash";

export const combineSegmentSubSequences = (notableSubsequencesOfWords: SegmentSubsequences[]) => ({
    segmentText: notableSubsequencesOfWords.map(({segmentText}) => segmentText).join('\n'),
    subsequences: flatten(notableSubsequencesOfWords.map(s => s.subsequences))
});