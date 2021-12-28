import { Dictionary } from "lodash";
import { AtomMetadata } from "../atom-metadata.interface.ts/atom-metadata";
import { Segment } from "./segment/segment";
import { XMLDocumentNode } from "../XMLDocumentNode";
import { SerializedSegment, IPositionedWord } from "../tabulation/tabulate";
import {SegmentSubsequences} from "../index";

export type DocumentWordCounts = {
    id: string;
    label: string;
}

export type TabulatedDocuments = TabulatedSegments & DocumentWordCounts

export type TabulatedSegments = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata[]>;
    wordSegmentMap: Dictionary<Segment[]>;
    segments: Segment[];
    atomMetadatas: Map<XMLDocumentNode, AtomMetadata>;
}

export interface SerializedTabulation {
    notableSubSequences: SegmentSubsequences[];
    wordSegmentSubSequencesMap: Map<string, Set<SegmentSubsequences>>;
    segmentWordCountRecordsMap: Map<SerializedSegment, IPositionedWord[]>;
}

export type SerializedDocumentTabulation = SerializedTabulation &
    DocumentWordCounts

