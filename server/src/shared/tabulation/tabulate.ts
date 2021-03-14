import {SetWithUniqueLengths} from "../tabulate-documents/set-with-unique-lengths";
import {Segment} from "../tabulate-documents/segment";
import {TabulatedDocuments, TabulatedSegments} from "../tabulate-documents/tabulated-documents.interface";
import {Dictionary} from "lodash";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {DocumentWordCount} from "../DocumentWordCount";

export interface TabulationConfiguration {
    notableCharacterSequences: SetWithUniqueLengths,
    segments: Segment[],
    greedyWordSet: SetWithUniqueLengths
}

export interface WordCountRecord {
    position: number;
    word: string;
}

export interface SerializedSegment {
    text: string;
    index: number;
}

export const tabulationFactory = (): TabulatedDocuments => ({
    wordCounts : {},
    wordElementsMap: {},
    wordSegmentMap: {},
    atomMetadatas : new Map<XMLDocumentNode, AtomMetadata>(),
    segmentWordCountRecordsMap: new Map<Segment, WordCountRecord[]>(),
    greedyWordCounts: new Map<string, number>(),
    wordSegmentStringsMap: new Map<string, Set<string>>(),
    segments: [],
    documentWordCounts: {},
    greedyDocumentWordCounts: new Map()
})

