import {Dictionary} from "lodash";
import {AtomizedSentence} from "./AtomizedSentence";

export interface AtomizedDocumentStats {
    wordCounts: Dictionary<number>;
    wordSentenceMap: Dictionary<AtomizedSentence[]>;
    text: string;
    head: string;
    body: string;
}