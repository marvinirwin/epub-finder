import {DocumentWordCounts, SerializedTabulation} from "../tabulated-documents.interface";
import {Dictionary} from "lodash";
import {AtomMetadata} from "../../atom-metadata/atom-metadata";
import {AbstractSegment, Segment, SegmentSubsequences} from "../../index";
import {AbstractNode} from "./abstractNode";

export function getWordSegmentSubsequencesMap<NodeType extends AbstractNode, SegmentType extends AbstractSegment<any>>(
    tabulationObject: SerializedTabulation & {
        wordElementsMap: Dictionary<AtomMetadata<NodeType, SegmentType>[]>;
        wordSegmentMap: Dictionary<SegmentType[]>;
        segments: Segment[];
        atomMetadatas: Map<NodeType, AtomMetadata<NodeType, SegmentType>>
    } & DocumentWordCounts,
    wordSegmentSubsequencesMap: Map<string, SegmentSubsequences[]>) {
    return new Map(
        Object.entries(
            tabulationObject.wordSegmentMap,
        ).map(([word]) => {
            return [
                word,
                new Set(wordSegmentSubsequencesMap.get(word) as SegmentSubsequences[]),
            ];
        }),
    );
}