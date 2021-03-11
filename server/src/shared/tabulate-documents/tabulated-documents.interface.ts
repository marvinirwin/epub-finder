import {Dictionary} from "lodash";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {Segment} from "./segment";
import {DocumentWordCount} from "../DocumentWordCount";
import {XMLDocumentNode} from "../XMLDocumentNode";

export type DocumentWordCounts = {
    documentWordCounts: Dictionary<DocumentWordCount[]>;
    greedyDocumentWordCounts: Map<string, DocumentWordCount[]>;
}

export type TabulatedDocuments  = TabulatedSentences & DocumentWordCounts;

export type TabulatedSentences = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata[]>;
    wordSegmentMap: Dictionary<Segment[]>;
    segments: Segment[];
    atomMetadatas: Map<XMLDocumentNode, AtomMetadata>
}

export interface SerializedTabulation {
    wordCounts: Dictionary<number>;
    greedyWordCounts: Map<string, number>;
    wordSegmentStringsMap: Map<string, Set<string>>;
}
export type SerializedDocumentTabulation = SerializedTabulation & DocumentWordCounts;

export const tabulatedSentenceToTabulatedDocuments = (
    tabulatedSentences: TabulatedSentences,
    documentLabel: string
): TabulatedDocuments => {
    const entries: [string, DocumentWordCount[]][] = Object.entries(tabulatedSentences.wordCounts)
        .map(([word, count]) =>
            [word, [{word, count, document: documentLabel}]]);

    return {
        ...tabulatedSentences,
        documentWordCounts: Object.fromEntries(entries),
        greedyDocumentWordCounts: new Map(entries)
    };
};