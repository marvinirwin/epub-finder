import {ReplaySubject} from "rxjs";
import {map} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {ScheduleRow} from "../ReactiveClasses/ScheduleRow";
import {colorForPercentage} from "../color/Range";
import {HighlightDelta, HighlighterConfig, HighlightMap} from "./highlight.interface";
import {HighlighterService} from "./highlighter.service";

const s = new HighlighterService();

export const timeWordsMap = (timeout: number, numbers: RGBA) => (words: string[]) => {
        const m = new Map<string, RGBA>();
        words.forEach(word => m.set(word, numbers))
        return ({
            timeout,
            delta: m
        });
    };


export const CORRECT_RECOGNITION_SCORE = 2;

/**
 * TODO probably execute all these things in a try since elements may disappear
 */
export class Highlighter {
    mousedOverWord$ = new ReplaySubject<string | undefined>(1);
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
        s.singleHighlight(
            this.mousedOverWord$.pipe(
                map(wordToMap([160, 160, 160, 0.5]))
            ),
            this.highlightMap$,
            config.visibleElements$,
            [0, 'MOUSEOVER_CHARACTER_HIGHLIGHT']
        )
        s.singleHighlight(
            this.mouseoverHighlightedSentences$.pipe(map(wordToMap([160, 160, 160, 0.5]))),
            this.highlightMap$,
            config.visibleElements$,
            [1,'MOUSEOVER_SENTENCE_HIGHLIGHT']
        );
        s.singleHighlight(
            config.quizWord$.pipe(map(wordToMap([28, 176, 246, 0.5]))),
            this.highlightMap$,
            config.visibleElements$,
            [0, 'QUIZ_WORD_HIGHLIGHT']
        );
        s.timedHighlight(
            this.deletedCards$.pipe(map(timeWordsMap(500, [234, 43, 43, 0.5]))),
            this.highlightMap$,
            config.visibleElements$,
            [0, 'DELETED_CARDS_HIGHLIGHT']
        );
        s.timedHighlight(
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
        s.singleHighlight(
            this.highlightWithDifficulty$.pipe(map(indexedScheduleRows => {
                const highlights: HighlightDelta = new Map<string, RGBA>();
                for (const word in indexedScheduleRows) {
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

export type RGBA = [number, number, number, number];
export type HighlighterPath = [number, string];

export interface HasElement {
    element: HTMLElement | XMLDocumentNode;
}

export const blendColors = (args: RGBA[]) => {
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
export const recomputeColor = (h: HighlightDelta | undefined): string => {
    if (!h) return `transparent`;
    // @ts-ignore
    const colors = [...h.values()];
    if (!colors.length) return `transparent`;
    return `RGBA(${blendColors(colors)})`
}

