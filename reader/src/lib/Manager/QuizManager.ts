import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import React from "react";
import {QuizCardProps} from "../../components/Quiz/Popup";
import {Characters} from "../../components/Quiz/Characters";
import {distinctUntilChanged, filter, map, shareReplay, startWith, withLatestFrom} from "rxjs/operators";
import {Pictures} from "../../components/Quiz/Pictures";
import {Conclusion} from "../../components/Quiz/Conclusion";
import {ScheduleRow} from "../ReactiveClasses/ScheduleRow";

export interface QuizResult {
    word: string;
    score: number;
}

export type QuizComponent = string;

export class QuizManager {
    quizzingCard$ = new ReplaySubject<ICard | undefined>(1);
    quizzingComponent$ = new ReplaySubject<QuizComponent>(1);
    quizResult$ = new Subject<QuizResult>();
    advanceQuizStage$ = new Subject();

    scheduledCards$ = new ReplaySubject<ICard[]>(1);

    /*
        learningCards$ = new Subject<ScheduleRow[]>();
        toReviewCards$ = new Subject<ScheduleRow[]>();
        newCards$ = new Subject<ScheduleRow[]>();
    */

    constructor() {
        this.quizzingCard$.pipe(
            startWith(undefined),
            filter(card => card === undefined),
            withLatestFrom(this.scheduledCards$)
        ).subscribe(([quizzingCard, scheduledCards]: [ICard | undefined, ICard[]]) => {
            let iCard = scheduledCards[0];
            if (iCard) {
                this.setQuizItem(iCard);
            }
        });

        this.scheduledCards$.pipe(
            withLatestFrom(
                this.quizzingCard$.pipe(
                    startWith(undefined),
                    filter(card => card === undefined)
                )
            )
        ).subscribe(([scheduledCards, quizzingCard]) => {
            let iCard = scheduledCards[0];
            if (iCard) {
                this.setQuizItem(iCard);
            }
        })

        this.advanceQuizStage$.pipe(
            withLatestFrom(this.quizzingComponent$)
        ).subscribe(([, currentDialogComponent]) => {
            switch (currentDialogComponent) {
                case "Characters":
                    this.quizzingComponent$.next("Pictures")
                    break;
                case "Pictures":
                    this.quizzingComponent$.next("Conclusion")
                    break;
            }
        })
    }

    setQuizItem(icard: ICard | undefined) {
        this.quizzingCard$.next(icard);
        this.quizzingComponent$.next("Characters")
    }

    completeQuiz(word: string, recognitionScore: number) {
        this.quizResult$.next({
            score: recognitionScore,
            word
        });
        this.setQuizItem(undefined);
    }

}