import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {debounceTime, map, switchMap, withLatestFrom} from "rxjs/operators";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import React from "react";
import {QuizCardProps} from "../../components/QuizPopup";


export interface ScorePair {
    word: string;
    score: number;
}

export class QuizManager {
    quizzingCard$: ReplaySubject<ICard | undefined> = new ReplaySubject<ICard | undefined>(1);
    queuCharacterToBeQuizzed: Subject<string> = new Subject<string>();
    nextScheduledQuizItem = new ReplaySubject<ICard>(1);
    completedQuizItem$ = new Subject<ScorePair>();

    currentQuizItem$ = new ReplaySubject<ICard>();
    currentQuizDialogComponent$ = new ReplaySubject<React.FunctionComponent<QuizCardProps>>(1);

    constructor() {
/*
        this.nextQuizItem$ = this.wordsSortedByPopularityDesc$.pipe(
            switchMap(rows => combineLatest(rows.map(r =>
                r.lastWordRecognitionRecord$
                    .pipe(
                        map(lastRecord => ({
                                lastRecord,
                                row: r
                            })
                        )
                    )
            )).pipe(debounceTime(100)))
        ).pipe(map(sortedRows => {
                let oneMinute = 60 * 1000;
                const oneMinuteAgo = (new Date()).getTime() - oneMinute;
                // r will be in descending order, so just find the one which has no record, or a record before 1 minute ago
                return sortedRows.find(({lastRecord, row}) => !lastRecord || lastRecord.timestamp.getTime() < oneMinuteAgo)?.lastRecord?.word
            }),
            withLatestFrom(this.cardManager.cardIndex$),
            map(([char, cardMap]) => {
                if (!char) return undefined;
                const cards = cardMap[char] || []
                return cards[0];
            })
        )
*/
    }
}