import {Dictionary} from "lodash";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {Segment} from "./segment/segment";
import {DocumentWordCount} from "../DocumentWordCount";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {SerializedSegment, WordCountRecord} from "../tabulation/tabulate";

export type DocumentWordCounts = {
    documentWordCounts: Dictionary<DocumentWordCount[]>;
    greedyDocumentWordCounts: Map<string, DocumentWordCount[]>;
    id: string;
    label: string;
}

export type TabulatedDocuments = TabulatedSegments & DocumentWordCounts;

export type TabulatedSegments = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata[]>;
    wordSegmentMap: Dictionary<Segment[]>;
    segments: Segment[];
    atomMetadatas: Map<XMLDocumentNode, AtomMetadata>
}

export interface SerializedTabulation {
    wordCounts: Dictionary<number>;
    greedyWordCounts: Map<string, number>;
    wordSegmentStringsMap: Map<string, Set<string>>;
    segmentWordCountRecordsMap: Map<SerializedSegment, WordCountRecord[]>
}

export type SerializedDocumentTabulation = SerializedTabulation & DocumentWordCounts;

export const tabulatedSentenceToTabulatedDocuments = (
    {
        tabulatedSentences,
        label,
        id
    }:
        {
            tabulatedSentences: TabulatedSegments,
            label: string,
            id?: string
        }
): TabulatedDocuments => {
    const entries: [string, DocumentWordCount[]][] = Object.entries(tabulatedSentences.wordCounts)
        .map(([word, count]) =>
            [word, [{word, count, document: label}]]);

    return {
        id,
        label,
        ...tabulatedSentences,
        documentWordCounts: Object.fromEntries(entries),
        greedyDocumentWordCounts: new Map(entries),
    };
};