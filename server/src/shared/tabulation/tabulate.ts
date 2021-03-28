import {SetWithUniqueLengths} from "../tabulate-documents/set-with-unique-lengths";
import {Segment} from "../tabulate-documents/segment/segment";
import {TabulatedDocuments, TabulatedSegments} from "../tabulate-documents/tabulated-documents.interface";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {XMLDocumentNode} from "../XMLDocumentNode";

export type TabulationParameters =  {
    segments: Segment[],
} & TabulationConfiguration
export interface TabulationConfiguration {
    notableCharacterSequences: SetWithUniqueLengths,
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
    greedyWordCounts: new Map<string, number>(),
    wordSegmentStringsMap: new Map<string, Set<string>>(),
    segments: [],
    documentWordCounts: {},
    greedyDocumentWordCounts: new Map(),
    segmentWordCountRecordsMap: new Map<SerializedSegment, WordCountRecord[]>(),
    label: '',
    id: ''
})

