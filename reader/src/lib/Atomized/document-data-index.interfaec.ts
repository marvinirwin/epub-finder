import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "./AtomizedSentence";
import {DocumentWordCount} from "../Interfaces/DocumentWordCount";

export interface DocumentDataIndex {
    wordElementsMap: Dictionary<IAnnotatedCharacter[]>;
    wordSentenceMap: Dictionary<AtomizedSentence[]>;
    wordCounts: Dictionary<number>;
    sentenceMap: Dictionary<AtomizedSentence[]>;
    documentWordCounts: Dictionary<DocumentWordCount[]>;
}