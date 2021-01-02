import {Observable} from "rxjs";
import {Dictionary} from "lodash";
import {AtomMetadata} from "../Interfaces/atom-metadata.interface.ts/atom-metadata";
import {Segment} from "../Atomized/segment";
import {ds_Dict} from "../Tree/DeltaScanner";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {RGBA} from "./color.service";

export interface HighlighterConfig {
    visibleSentences$: Observable<Dictionary<Segment[]>>;
    quizWord$: Observable<string | undefined>;
}

export interface TimedHighlightDelta {
    timeout: number;
    delta: HighlightDelta;
}

export type TargetHighlightPriorityList = Map<HighlightTarget, HighlightDelta[]>;



/**
 * If I am a highlighter and I want something highlighted I submit an object of elements/Words and colors to highlight
 */
export type HighlightDelta = Map<HighlightTarget, RGBA>

/**
 * A bunch of highlight deltas where the first one is the highest priority and so on
 */
export type HighlightDeltaPriorityList = HighlightDelta[];

export type ElementHighlightMap = Map<HTMLElement, HighlightDeltaPriorityList[]>;

export type HighlightTarget = HTMLElement | string;
