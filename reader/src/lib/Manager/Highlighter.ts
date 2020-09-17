import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {withLatestFrom, map} from "rxjs/operators";
import {ds_Dict} from "../Util/DeltaScanner";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";

/**
 * TODO probably execute all these things in a try since elements may disappear
 */
export class Highlighter {
    mouseoverHighlightedWords$ = new ReplaySubject<string | undefined>(1);
    mouseoverHighlightedSentences$ = new ReplaySubject<string | undefined>(1)
    highlightMap$ = new ReplaySubject<HighlightMap>(1);

    constructor(config: HighlighterConfig) {
        singleHighlight(
            this.mouseoverHighlightedWords$.pipe(map(word => (word ? {[word]: [160, 160, 160, 0.5]} : {}))),
            this.highlightMap$,
            config.visibleElements$,
            'MOUSEOVER_CHARACTER_HIGHLIGHT'
        )
        singleHighlight(
            this.mouseoverHighlightedWords$.pipe(map(word => (word ? {[word]: [160, 160, 160, 0.5]} : {}))),
            this.highlightMap$,
            config.visibleElements$,
            'MOUSEOVER_SENTENCE_HIGHLIGHT'
        );

        this.highlightMap$.next({});
    }
}

interface HighlighterConfig {
    visibleElements$: Observable<Dictionary<IAnnotatedCharacter[]>>;
    visibleSentences$: Observable<Dictionary<AtomizedSentence[]>>;
}

/**
 * If I am a highlighter and I want something highlighted I submit an object of words and colors to highlight
 */
export interface HighlightDelta {
    [key: string]: RGBA
}

export interface TimedHighlightDelta {
    timeout: number;
    delta: HighlightDelta;
}

export type RGBA = [number, number, number, number];

function removeHighlightDelta(oldHighlightDelta: HighlightDelta, currentHighlightMap: ObservedValueOf<Observable<HighlightMap>>, highlighterKey: string, highlightWordsToUpdate: Set<string>) {
    Object.entries(oldHighlightDelta).forEach(([word, colors]) => {
        // TODO figure out if this is tolerant of nonexistant word keys
        delete currentHighlightMap[word][highlighterKey];
        highlightWordsToUpdate.add(word);
    });
}

function singleHighlight(
    newHighlightDelta$: Observable<HighlightDelta | undefined>,
    highlightedWords$: Observable<HighlightMap>,
    wordElementMap$: Observable<ds_Dict<HasElement[]>>,
    highlighterKey: string
) {
    let oldHighlightDelta: HighlightDelta | undefined;
    newHighlightDelta$.pipe(
        withLatestFrom(highlightedWords$, wordElementMap$),
    ).subscribe(([newHighlightDelta, currentHighlightMap, wordElementMap]) => {
        const highlightWordsToUpdate = new Set<string>();
        if (oldHighlightDelta) {
            /**
             * For one-at-a-time highlighters delete all previous highlights whenever a new one appears
             */
            removeHighlightDelta(oldHighlightDelta, currentHighlightMap, highlighterKey, highlightWordsToUpdate);
        }
        if (newHighlightDelta) {
            addHighlightedDelta(newHighlightDelta, currentHighlightMap, highlighterKey, highlightWordsToUpdate);
        }
        updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
    })
}

function updateHighlightBackgroundColors(
    highlightWordsToUpdate: Set<string>,
    wordElementMap: ds_Dict<HasElement[]>,
    currentHighlightMap: HighlightMap) {
    // @ts-ignore
    for (var word of highlightWordsToUpdate) {
        const elements = wordElementMap[word];
        const backgroundColor = recomputeColor(currentHighlightMap[word]);
        // @ts-ignore
        elements.forEach(element => element.element.style.backgroundColor = backgroundColor)
    }
}

function addHighlightedDelta(o: HighlightDelta, currentHighlightMap: HighlightMap, highlighterKey: string, highlightWordsToUpdate: Set<string>) {
    Object.entries(o).forEach(([word, colors]) => {
        currentHighlightMap[word][highlighterKey] = colors;
        highlightWordsToUpdate.add(word);
    });
}

function timedHighlight(
    newHighlightDelta$: Observable<TimedHighlightDelta>,
    highlightedWords$: Observable<HighlightMap>,
    wordElementMap$: Observable<ds_Dict<HasElement[]>>,
    highlighterKey: string
) {
    newHighlightDelta$.pipe(
        withLatestFrom(highlightedWords$, wordElementMap$),
    ).subscribe(([timedHighlightDelta, currentHighlightMap, wordElementMap]) => {
        const highlightWordsToUpdate = new Set<string>();
        let o = timedHighlightDelta.delta;
        addHighlightedDelta(o, currentHighlightMap, highlighterKey, highlightWordsToUpdate);
        // @ts-ignore
        updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
        setTimeout(() => {
            removeHighlightDelta(timedHighlightDelta.delta, currentHighlightMap, highlighterKey, highlightWordsToUpdate);
            updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
        }, timedHighlightDelta.timeout)
    })
}

export interface HasElement {
    element: HTMLElement | XMLDocumentNode;
}

export type HighlightMap = {
    [key: string]: HighlightedWord
}

/**
 * A highlighted word has a list of Highlighters who have highlighted this word, and the colors they use
 */
export type HighlightedWord = {
    [key: string]: RGBA
}

function blendColors(args: RGBA[]) {
    args = args.slice();
    let base = [0, 0, 0, 0];
    let mix;
    let added;
    while (added = args.shift()) {
        if (typeof added[3] === 'undefined') {
            added[3] = 1;
        }
        // check if both alpha channels exist.
        if (base[3] && added[3]) {
            mix = [0, 0, 0, 0];
            // alpha
            mix[3] = 1 - (1 - added[3]) * (1 - base[3]);
            // red
            mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3]));
            // green
            mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3]));
            // blue
            mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3]));

        } else if (added) {
            mix = added;
        } else {
            mix = base;
        }
        base = mix;
    }

    return mix;
}

/**
 * This could be a generator
 * That's too fancy for now
 * @param h
 */
function recomputeColor(h: HighlightDelta): string {
    const colors = Object.values(h);
    return `RGBA(${blendColors(colors)})`
}

