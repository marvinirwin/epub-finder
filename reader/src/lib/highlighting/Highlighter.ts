import {ReplaySubject} from "rxjs";
import {map} from "rxjs/operators";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {XMLDocumentNode} from "../../../../server/src/shared/XMLDocumentNode";
import {HighlighterService} from "./highlighter.service";
import {RGBA} from "./color.service";
import {QuizService} from "../../components/quiz/quiz.service";
import {ScheduleRow} from "../schedule/schedule-row";

export const timeWordsMap = (timeout: number, numbers: RGBA) => (words: string[]) => {
    const m = new Map<string, RGBA>();
    words.forEach(word => m.set(word, numbers))
    return ({
        timeout,
        delta: m
    });
};


export const CORRECT_RECOGNITION_SCORE = 3;

/**
 * TODO probably execute all these things in a try since elements may disappear
 */
export class Highlighter {
    mouseoverHighlightedSentences$ = new ReplaySubject<string | undefined>(1);
    deletedCards$ = new ReplaySubject<string[]>(1);
    createdCards$ = new ReplaySubject<string[]>(1);
    highlightWithDifficulty$ = new ReplaySubject<ds_Dict<ScheduleRow>>(1);

    constructor({
                    highlighterService,
                }: {
        highlighterService: HighlighterService
    }) {
        const s = highlighterService;
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

