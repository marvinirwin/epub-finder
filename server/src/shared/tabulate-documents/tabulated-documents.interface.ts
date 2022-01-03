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

export type TabulatedDocuments<T extends AbstractSegment<U>, U extends AbstractNode> = TabulatedSegments<T, U> & DocumentWordCounts

export type TabulatedSegments<T extends AbstractSegment<U>, U extends AbstractNode> = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata<T, U>[]>;
    wordSegmentMap: Dictionary<T[]>;
    segments: Segment[];
    atomMetadatas: Map<U, AtomMetadata<T, U>>;
}

export interface SerializedTabulation {
    notableSubSequences: SegmentSubsequences[];
    wordSegmentSubSequencesMap: Map<string, Set<SegmentSubsequences>>;
    segmentWordCountRecordsMap: Map<SerializedSegment, IPositionedWord[]>;
}

export type SerializedDocumentTabulation = SerializedTabulation &
    DocumentWordCounts

