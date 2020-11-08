import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {Dictionary} from "lodash";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {map} from "rxjs/operators";
import {ds_Dict} from "../Util/DeltaScanner";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {ScheduleRow} from "../ReactiveClasses/ScheduleRow";
import {colorForPercentage} from "../color/Range";

function timeWordsMap(timeout: number, numbers: RGBA): (words: string[]) => TimedHighlightDelta {
    return (words: string[]) => {
        const m = new Map<string, RGBA>();
        words.forEach(word => m.set(word, numbers))
        return ({
            timeout: timeout,
            delta: m
        });
    };
}

export const CORRECT_RECOGNITION_SCORE = 2;

/**
 * TODO probably execute all these things in a try since elements may disappear
 */
export class Highlighter {
    mouseoverHighlightedWords$ = new ReplaySubject<string | undefined>(1);
    mouseoverHighlightedSentences$ = new ReplaySubject<string | undefined>(1);
    deletedCards$ = new ReplaySubject<string[]>(1);
    createdCards$ = new ReplaySubject<string[]>(1);
    highlightMap$ = new ReplaySubject<HighlightMap>(1);
    highlightWithDifficulty$ = new ReplaySubject<ds_Dict<ScheduleRow>>(1);

    constructor(config: HighlighterConfig) {
        const wordToMap = (rgba: RGBA) => (word: string | undefined) => {
            const m = new Map<string, RGBA>();
            if (word) {
                m.set(word, rgba)
            }
            return m;
        }
        singleHighlight(
            this.mouseoverHighlightedWords$.pipe(
                map(wordToMap([160, 160, 160, 0.5]))
            ),
            this.highlightMap$,
            config.visibleElements$,
            [0, 'MOUSEOVER_CHARACTER_HIGHLIGHT']
        )
        singleHighlight(
            this.mouseoverHighlightedSentences$.pipe(map(wordToMap([160, 160, 160, 0.5]))),
            this.highlightMap$,
            config.visibleElements$,
            [1,'MOUSEOVER_SENTENCE_HIGHLIGHT']
        );
        singleHighlight(
            config.quizWord$.pipe(map(wordToMap([28, 176, 246, 0.5]))),
            this.highlightMap$,
            config.visibleElements$,
            [0, 'QUIZ_WORD_HIGHLIGHT']
        );
        timedHighlight(
            this.deletedCards$.pipe(map(timeWordsMap(500, [234, 43, 43, 0.5]))),
            this.highlightMap$,
            config.visibleElements$,
            [0, 'DELETED_CARDS_HIGHLIGHT']
        );
        timedHighlight(
            this.createdCards$.pipe(map(timeWordsMap(500, [255, 215, 0, 0.5]))),
            this.highlightMap$,
            config.visibleElements$,
            [0, 'CREATED_CARDS_HIGHLIGHT']
        );
        const now = new Date();
        function clamp(min: number, max: number, v: number) {
            if (v < min) return min;
            if (v > max) return max;
            return v;
        }
        function getDatePercentage(d: Date): number {
            const date = d.getTime();
            const sevenDays = 86400000 * 7;
            const SevenDaysAgo = now.getTime() - sevenDays;
            const sevenDaysInTheFuture = now.getTime() + sevenDays;
            const fourteenDays = sevenDays * 2;
            const clampedDate = clamp(0.001, fourteenDays - 0.001 , date - SevenDaysAgo);
            const percentage = clampedDate / fourteenDays * 100;
            return percentage;
        }
        singleHighlight(
            this.highlightWithDifficulty$.pipe(map(indexedScheduleRows => {
                const highlights: HighlightDelta = new Map<string, RGBA>();
                for (let word in indexedScheduleRows) {
                    const row = indexedScheduleRows[word];
                    if (row.wordRecognitionRecords.length) {
                        let correct = 0;
                        for (let i = row.wordRecognitionRecords.length - 1; i >= 0; i--) {
                            const wordRecognitionRecord = row.wordRecognitionRecords[i];
                            if (wordRecognitionRecord.recognitionScore >= CORRECT_RECOGNITION_SCORE) {
                                correct++;
                            } else {
                                break;
                            }
                        }
                        highlights.set(word, colorForPercentage(clamp(0.001, correct * 25, 100)))
                    }
                }
                return highlights;
            })),
            this.highlightMap$,
            config.visibleElements$,
            [2, 'DIFFICULTY_HIGHLIGHT']
        )


        this.highlightMap$.next({});
    }
}

interface HighlighterConfig {
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

export type RGBA = [number, number, number, number];
export type HighlighterPath = [number, string];

function removeHighlightDelta(
    oldHighlightDelta: HighlightDelta,
    currentHighlightMap: HighlightMap,
    [highlightPriority, highlightKey]: HighlighterPath,
    highlightWordsToUpdate: Set<string>) {
    oldHighlightDelta.forEach((colors, word) => {
        currentHighlightMap[word][highlightPriority].delete(highlightKey);
        highlightWordsToUpdate.add(word);
    })
}

function singleHighlight(
    newHighlightDelta$: Observable<HighlightDelta | undefined>,
    highlightedWords$: Observable<HighlightMap>,
    wordElementMap$: Observable<ds_Dict<HasElement[]>>,
    highlightPath: HighlighterPath,
) {
    let oldHighlightDelta: HighlightDelta | undefined;
    combineLatest([
        newHighlightDelta$, highlightedWords$, wordElementMap$
    ]).subscribe(([newHighlightDelta, currentHighlightMap, wordElementMap]) => {
        const highlightWordsToUpdate = new Set<string>();
        if (oldHighlightDelta) {
            /**
             * For one-at-a-time highlighters delete all previous highlights whenever a new one appears
             */
            removeHighlightDelta(oldHighlightDelta, currentHighlightMap, highlightPath, highlightWordsToUpdate);
        }
        if (newHighlightDelta) {
            oldHighlightDelta = newHighlightDelta;
            addHighlightedDelta(newHighlightDelta, currentHighlightMap, highlightPath, highlightWordsToUpdate);
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

        if (!elements) continue;
        const highestPriorityColors = currentHighlightMap[word].find(map => map && map.size);
        const backgroundColor = recomputeColor(
            highestPriorityColors
        );

        elements.forEach(element => {
            // @ts-ignore
            return element.element.style.backgroundColor = backgroundColor;
        })
    }
}

function addHighlightedDelta(
    highlightDelta: HighlightDelta,
    currentHighlightMap: HighlightMap,
    [ highlightPriority, highlightKey ]: HighlighterPath,
    highlightWordsToUpdate: Set<string>) {
    highlightDelta.forEach((rgba, word) => {
        if (!currentHighlightMap[word]) {
            currentHighlightMap[word] = [];
        }
        if (!currentHighlightMap[word][highlightPriority]) {
            currentHighlightMap[word][highlightPriority] = new Map();
        }
        currentHighlightMap[word][highlightPriority].set(highlightKey, rgba);
        highlightWordsToUpdate.add(word);
    })
}

function timedHighlight(
    newHighlightDelta$: Observable<TimedHighlightDelta>,
    highlightedWords$: Observable<HighlightMap>,
    wordElementMap$: Observable<ds_Dict<HasElement[]>>,
    highlighterPath: HighlighterPath
) {
    combineLatest([
        newHighlightDelta$,
        highlightedWords$,
        wordElementMap$
    ]).subscribe(([timedHighlightDelta, currentHighlightMap, wordElementMap]) => {
        const highlightWordsToUpdate = new Set<string>();
        let o = timedHighlightDelta.delta;
        addHighlightedDelta(o, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
        // @ts-ignore
        updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
        setTimeout(() => {
            removeHighlightDelta(timedHighlightDelta.delta, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
            updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
        }, timedHighlightDelta.timeout)
    })
}

export interface HasElement {
    element: HTMLElement | XMLDocumentNode;
}

export type HighlightMap = {
    [key: string]: HighlightedWord[]
}

/**
 * A highlighted word has a list of Highlighters who have highlighted this word, and the colors they use
 */
export type HighlightedWord = Map<string, RGBA>

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
function recomputeColor(h: HighlightDelta | undefined): string {
    if (!h) return `transparent`;
    // @ts-ignore
    const colors = [...h.values()];
    if (!colors.length) return `transparent`;
    return `RGBA(${blendColors(colors)})`
}

