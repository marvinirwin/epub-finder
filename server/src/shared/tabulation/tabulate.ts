import { SetWithUniqueLengths } from "../tabulate-documents/set-with-unique-lengths";
import { Segment } from "../tabulate-documents/segment/segment";
import { TabulatedDocuments } from "../tabulate-documents/tabulated-documents.interface";
import { AtomMetadata } from "../atom-metadata.interface.ts/atom-metadata";
import { XMLDocumentNode } from "../XMLDocumentNode";
import {SegmentSubsequences} from "../index";

export type TabulationParameters = {
    segments: Segment[];
} & TabulationConfiguration


export type WordIdentifyingStrategy = "noSeparator" | "spaceSeparator"

export type SerializableTabulationConfiguration = {
    notableCharacterSequences: SetWithUniqueLengths;
    greedyWordSet: SetWithUniqueLengths;
    language_code: string;
}
export type TabulationConfiguration = SerializableTabulationConfiguration & {
    isNotableCharacterRegex: RegExp;
    isWordBoundaryRegex: RegExp;
    wordIdentifyingStrategy: WordIdentifyingStrategy;
}

export interface IPositionedWord {
    position: number;
    word: string;
}

export interface SerializedSegment {
    text: string;
    index: number;
}

export const tabulationFactory = (): TabulatedDocuments => ({
    wordElementsMap: {},
    wordSegmentMap: {},
    notableSubSequences: [],
    atomMetadatas: new Map<XMLDocumentNode, AtomMetadata>(),
    wordSegmentSubSequencesMap: new Map<string, Set<SegmentSubsequences>>(),
    segments: [],
    segmentWordCountRecordsMap: new Map<SerializedSegment, IPositionedWord[]>(),
    label: "",
    id: "",
});
