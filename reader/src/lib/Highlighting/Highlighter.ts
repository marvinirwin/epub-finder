import {ReplaySubject} from "rxjs";
import {map, tap} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {HighlighterService} from "./highlighter.service";
import {RGBA} from "./color.service";
import {ScheduleRow} from "../schedule/schedule-row.interface";
import {QuizService} from "../../components/quiz/quiz.service";

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
    highlightWithDifficulty$ = new ReplaySubject<ds_Dict<ScheduleRow>>(1);

    constructor({
                    highlighterService,
        quizService
    }: {
        quizService: QuizService
        highlighterService: HighlighterService
    }) {
        const s = highlighterService;
        const {wordToMap} = HighlighterService;
        const rgba: RGBA = [160, 160, 160, 0.5];
        s.singleHighlight(
            this.mousedOverWord$.pipe(
                map(wordToMap(rgba))
            ),
            [0, 'MOUSEOVER_CHARACTER_HIGHLIGHT']
        );
        s.singleHighlight(
            this.mouseoverHighlightedSentences$
                .pipe(
                    map(wordToMap(rgba)),
                ),
            [1,'MOUSEOVER_SENTENCE_HIGHLIGHT']
        );
        s.singleHighlight(
            quizService.quizCard.word$.pipe(map(wordToMap([28, 176, 246, 0.5]))),
            [0, 'QUIZ_WORD_HIGHLIGHT']
        );
        s.timedHighlight(
            this.deletedCards$.pipe(map(timeWordsMap(500, [234, 43, 43, 0.5]))),
            s.highlightMap$,
            [0, 'DELETED_CARDS_HIGHLIGHT']
        );
        s.timedHighlight(
            this.createdCards$.pipe(map(timeWordsMap(500, [255, 215, 0, 0.5]))),
            s.highlightMap$,
            [0, 'CREATED_CARDS_HIGHLIGHT']
        );


        s.highlightMap$.next(new Map());
    }

}

export interface LtElement {
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

