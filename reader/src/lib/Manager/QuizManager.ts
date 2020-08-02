import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import React from "react";
import {QuizCardProps} from "../../components/Quiz/Popup";
import {Characters} from "../../components/Quiz/Characters";
import {withLatestFrom} from "rxjs/operators";
import {Pictures} from "../../components/Quiz/Pictures";
import {Conclusion} from "../../components/Quiz/Conclusion";

export interface QuizResult {
    word: string;
    score: number;
}

export type QuizComponent = React.FunctionComponent<QuizCardProps>
export class QuizManager {
    scheduleQuizItemList$ = new ReplaySubject<ICard[]>(1);
    completedQuizItem$ = new Subject<QuizResult>();

    currentQuizItem$ = new ReplaySubject<ICard | undefined>(1);
    currentQuizDialogComponent$ = new ReplaySubject<QuizComponent>(1);

    advanceQuiz$ = new Subject();


    constructor() {}

    setQuizItem(icard: ICard) {
        this.currentQuizItem$.next(icard);
        this.currentQuizDialogComponent$.next(Characters)
            this.currentQuizItem$.pipe(withLatestFrom(this.scheduleQuizItemList$)).subscribe(([item, nextScheduledItems]) => {
                if (!item) {
                    this.currentQuizItem$.next(nextScheduledItems[0])
                }
            })

        this.advanceQuiz$.pipe(
            withLatestFrom(this.currentQuizDialogComponent$)
        ).subscribe(([, currentDialogComponent]) => {
            switch(currentDialogComponent) {
                case Characters:
                    this.currentQuizDialogComponent$.next(Pictures)
                    break;
                case Pictures:
                    this.currentQuizDialogComponent$.next(Conclusion)
            }
        })
    }

    sendWordRec(word: string, recognitionScore: number) {
        this.completedQuizItem$.next({
            score: recognitionScore,
            word
        })
        this.currentQuizDialogComponent$.next()
    }

}