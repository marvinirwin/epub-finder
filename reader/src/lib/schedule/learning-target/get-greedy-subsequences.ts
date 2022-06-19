import {SegmentSubsequences} from "@shared/*";
import {IPositionedWord} from "@shared/";
import {groupBy} from "lodash";

export const getGreedySubSequences = (subSequences: SegmentSubsequences): SegmentSubsequences => {
    const greedySubSequences: IPositionedWord[] = [];
    const groupedByPosition = Object.values(groupBy(subSequences.subsequences, r => r.position));
    for (let i = 0; i < groupedByPosition.length; i++) {
        const currentGroup = groupedByPosition[i];
        const subSequence = currentGroup[currentGroup.length - 1];
        const previousSubSequence = greedySubSequences[greedySubSequences.length - 1];
        if (previousSubSequence === undefined ||
            subSequence.position >= (previousSubSequence.position + previousSubSequence.word.length)) {
            greedySubSequences.push(subSequence)
        }
    }
    return {...subSequences, subsequences: greedySubSequences};
}

export const getSegmentText = (segmentSubsequences: SegmentSubsequences) => {
}