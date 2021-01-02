import {Dictionary} from "lodash";
import {AtomMetadata} from "../Interfaces/atom-metadata.interface.ts/atom-metadata";
import {Segment} from "./segment";
import {DocumentWordCount} from "../Interfaces/DocumentWordCount";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";

export interface TabulatedDocuments extends TabulatedSentences {
    documentWordCounts: Dictionary<DocumentWordCount[]>;
}
export interface TabulatedSentences {
    wordElementsMap: Dictionary<AtomMetadata[]>;
    wordSegmentMap: Dictionary<Segment[]>;
    wordCounts: Dictionary<number>;
    segments: Dictionary<Segment[]>;
    atomMetadatas: Map<XMLDocumentNode, AtomMetadata>
}
