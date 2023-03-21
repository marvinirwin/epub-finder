import { Dictionary } from "lodash";
import { AtomMetadata } from "../atom-metadata/atom-metadata";
import { Segment } from "./segment/segment";
import { SerializedSegment, PositionedWord } from "../tabulation/tabulate-types";
import {AbstractSegment, SegmentSubsequences} from "../index";
import {AbstractNode} from "./tabulate-segment/abstractNode";

export type DocumentWordCounts = {
    id: string;
    label: string;
}

export type TabulatedDocuments<U extends AbstractNode = AbstractNode, T extends AbstractSegment<U> = AbstractSegment<U>> = TabulatedSegments<U, T> & DocumentWordCounts

export type TabulatedSegments<NodeType extends AbstractNode = AbstractNode, SegmentType extends AbstractSegment<NodeType> = AbstractSegment<NodeType>> = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata<NodeType, SegmentType>[]>;
    wordSegmentMap: Dictionary<SegmentType[]>;
    segments: Segment[];
    atomMetadatas: Map<NodeType, AtomMetadata<NodeType, SegmentType>>;
}

export interface SerializedTabulation {
    notableSubSequences: SegmentSubsequences[];
    wordSegmentSubSequencesMap: Map<string, Set<SegmentSubsequences>>;
    segmentWordCountRecordsMap: Map<SerializedSegment, PositionedWord[]>;
}

export type SerializedDocumentTabulation = SerializedTabulation &
    DocumentWordCounts

