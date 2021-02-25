import {Dictionary} from "lodash";
import {AtomMetadata} from "../atom-metadata.interface.ts/atom-metadata";
import {Segment} from "./segment";
import {DocumentWordCount} from "../DocumentWordCount";
import {XMLDocumentNode} from "../XMLDocumentNode";

export type TabulatedDocuments  = TabulatedSentences & {
    documentWordCounts: Dictionary<DocumentWordCount[]>;
}

export type TabulatedSentences = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata[]>;
    wordSegmentMap: Dictionary<Segment[]>;
    segments: Segment[];
    atomMetadatas: Map<XMLDocumentNode, AtomMetadata>
}

export interface SerializedTabulation {
    wordCounts: Dictionary<number>;
    wordSegmentStringsMap: Map<string, Set<string>>;
}

export const tabulatedSentenceToTabulatedDocuments = (
    tabulatedSentences: TabulatedSentences,
    documentLabel: string
): TabulatedDocuments => {
    const entries = Object.entries(tabulatedSentences.wordCounts)
        .map(([word, count]) =>
            [word, [{word, count, document: documentLabel}]]);

    return {
        ...tabulatedSentences,
        documentWordCounts: Object.fromEntries(entries)
    };
};