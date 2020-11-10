import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {RGBA} from "./Highlighter";

export interface HighlighterConfig {
    visibleElements$: Observable<Dictionary<IAnnotatedCharacter[]>>;
    visibleSentences$: Observable<Dictionary<AtomizedSentence[]>>;
    quizWord$: Observable<string | undefined>;
}

/**
 * If I am a highlighter and I want something highlighted I submit an object of words and colors to highlight
 */
export type HighlightDelta = Map<string, RGBA>

export interface TimedHighlightDelta {
    timeout: number;
    delta: HighlightDelta;
}

export type HighlightMap = {
    [key: string]: HighlightedWord[]
}
/**
 * A highlighted word has a list of Highlighters who have highlighted this word, and the colors they use
 */
export type HighlightedWord = Map<string, RGBA>