import {Dictionary} from "lodash";
import {AtomMetadata} from "../interfaces/atom-metadata.interface.ts/atom-metadata";
import {Segment} from "./segment";
import {DocumentWordCount} from "../interfaces/DocumentWordCount";
import {XMLDocumentNode} from "../interfaces/XMLDocumentNode";

export interface TabulatedDocuments extends TabulatedSentences {
    documentWordCounts: Dictionary<DocumentWordCount[]>;
}
export interface TabulatedSentences {
    wordElementsMap: Dictionary<AtomMetadata[]>;
    wordSegmentMap: Dictionary<Segment[]>;
    wordCounts: Dictionary<number>;
    segments: Segment[];
    atomMetadatas: Map<XMLDocumentNode, AtomMetadata>
}
