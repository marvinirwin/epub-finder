import {Dictionary} from "lodash";

export function getWordSegmentMap<SegmentType, NodeType>(wordSegmentMap: Dictionary<SegmentType[]>) {
    return Object.fromEntries(
        Object.entries(wordSegmentMap).map(([word, segmentSet]) => [
            word,
            Array.from(segmentSet),
        ]),
    );
}