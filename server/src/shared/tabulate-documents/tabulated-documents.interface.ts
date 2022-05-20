import { Dictionary } from "lodash";
import { AtomMetadata } from "../atom-metadata.interface.ts/atom-metadata";
import { Segment } from "./segment/segment";
import { SerializedSegment, IPositionedWord } from "../tabulation/tabulate";
import {SegmentSubsequences} from "../index";
import {AbstractNode, AbstractSegment} from "./tabulate-segment/tabulate";

export type DocumentWordCounts = {
    id: string;
    label: string;
}

export type TabulatedDocuments<U extends AbstractNode = AbstractNode, T extends AbstractSegment<U> = AbstractSegment<U>> = TabulatedSegments<U, T> & DocumentWordCounts

export type TabulatedSegments<NodeType extends AbstractNode = AbstractNode, SegmentType extends AbstractSegment<NodeType> = AbstractSegment<NodeType>> = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata<SegmentType, NodeType>[]>;
    wordSegmentMap: Dictionary<SegmentType[]>;
    segments: Segment[];
    atomMetadatas: Map<NodeType, AtomMetadata<SegmentType, NodeType>>;
}

export interface SerializedTabulation {
    notableSubSequences: SegmentSubsequences[];
    wordSegmentSubSequencesMap: Map<string, Set<SegmentSubsequences>>;
    segmentWordCountRecordsMap: Map<SerializedSegment, IPositionedWord[]>;
}

export type SerializedDocumentTabulation = SerializedTabulation &
    DocumentWordCounts

