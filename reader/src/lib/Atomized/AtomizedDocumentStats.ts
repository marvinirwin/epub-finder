import {Dictionary} from "lodash";
import {AtomizedSentence} from "./AtomizedSentence";
import {ds_Dict} from "../Tree/DeltaScanner";
import {DocumentWordCount} from "../Interfaces/DocumentWordCount";

export interface AtomizedDocumentStats {
    wordCounts: Dictionary<number>;
    wordSentenceMap: Dictionary<AtomizedSentence[]>;
    text: string;
    head: string;
    body: string;
}

export interface AtomizedDocumentDocumentStats extends AtomizedDocumentStats {
    documentWordCounts: ds_Dict<DocumentWordCount>;
}
