import { SetWithUniqueLengths } from "../tabulate-documents/set-with-unique-lengths";
import { TabulatedDocuments } from "../tabulate-documents/tabulated-documents.interface";
import { AtomMetadata } from "../atom-metadata/atom-metadata";
import {SegmentSubsequences, SplitWordsDto, SplitWordsResponseDto} from "../index";
import {AbstractSegment} from "../tabulate-documents/tabulate-segment/abstractSegment";
import {AbstractNode} from "../tabulate-documents/tabulate-segment/abstractNode";

export type TabulationParameters<T> = {
    segments: T[];
} & TabulationConfiguration


export type WordIdentifyingStrategy = "noSeparator" | "spaceSeparator" | "thai"

export type SerializableTabulationConfiguration = {
    notableCharacterSequences: SetWithUniqueLengths;
    greedyWordSet: SetWithUniqueLengths;
    language_code: string;
}
export type WordSplitFunction = (dto: SplitWordsDto) => Promise<SplitWordsResponseDto>;
export type TabulationConfiguration = SerializableTabulationConfiguration & {
    isNotableCharacterRegex: RegExp;
    isWordBoundaryRegex: RegExp;
    wordIdentifyingStrategy: WordIdentifyingStrategy;
    wordSplitFunction?: WordSplitFunction;
}

export interface PositionedWord {
    position: number;
    word: string;
}

export interface SerializedSegment {
    text: string;
    index: number;
}


export const tabulationFactory = <T extends AbstractSegment<U>, U extends AbstractNode>(): TabulatedDocuments<U, T> => ({
    wordElementsMap: {},
    wordSegmentMap: {},
    notableSubSequences: [],
    atomMetadatas: new Map<U, AtomMetadata<U, T>>(),
    wordSegmentSubSequencesMap: new Map<string, Set<SegmentSubsequences>>(),
    segments: [],
    segmentWordCountRecordsMap: new Map<SerializedSegment, PositionedWord[]>(),
    label: "",
    id: "",
});
