import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {ds_Dict} from "../Tree/DeltaScanner";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {RGBA} from "./color.service";

export interface HighlighterConfig {
    visibleElements$: Observable<Dictionary<IAnnotatedCharacter[]>>;
    visibleSentences$: Observable<Dictionary<AtomizedSentence[]>>;
    quizWord$: Observable<string | undefined>;
}

export interface TimedHighlightDelta {
    timeout: number;
    delta: HighlightDelta;
}

export interface WordHighlightMap {
    [key: string]: HighlightedWord[]
}

/**
 * If I am a highlighter and I want something highlighted I submit an object of words and colors to highlight
 */
export type HighlightDelta = Map<string, RGBA>

export type HighlightDeltaPriorityList = HighlightDelta[];

export type ElementHighlightMap = Map<HTMLElement, HighlightDeltaPriorityList[]>;

/**
 * A highlighted word has a list of Highlighters who have highlighted this word, and the colors they use
 */
export type HighlightedWord = Map<string, RGBA>