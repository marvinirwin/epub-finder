import {Dictionary} from "lodash";
import {safePush} from "../../safe-push";

export function getTryAndUseFirstSplitWordFunction<NodeType, SegmentType>(elementSegmentMap: Map<NodeType, SegmentType>, allMarks: NodeType[], i: number, wordSegmentMap: Dictionary<SegmentType[]>, currentMark: NodeType, notableSequencesWhichStartHere: string[]) {
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
    return tryAndUseFirstSplitWord;
}