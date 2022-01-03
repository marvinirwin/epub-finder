import { SetWithUniqueLengths } from "../tabulate-documents/set-with-unique-lengths";
import { Segment } from "../tabulate-documents/segment/segment";
import { TabulatedDocuments } from "../tabulate-documents/tabulated-documents.interface";
import { AtomMetadata } from "../atom-metadata.interface.ts/atom-metadata";
import { XMLDocumentNode } from "../XMLDocumentNode";
import {SegmentSubsequences} from "../index";
import {AbstractNode, AbstractSegment} from "../tabulate-documents/tabulate-segment/tabulate";

export type TabulationParameters<T> = {
    segments: T[];
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

export const tabulationFactory = <T extends AbstractSegment<U>, U extends AbstractNode>(): TabulatedDocuments<T, U> => ({
    wordElementsMap: {},
    wordSegmentMap: {},
    notableSubSequences: [],
    atomMetadatas: new Map<U, AtomMetadata<T, U>>(),
    wordSegmentSubSequencesMap: new Map<string, Set<SegmentSubsequences>>(),
    segments: [],
    segmentWordCountRecordsMap: new Map<SerializedSegment, IPositionedWord[]>(),
    label: "",
    id: "",
});
