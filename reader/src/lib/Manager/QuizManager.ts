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

    quizzingCard$ = new ReplaySubject<ICard | undefined>(1);
    quizzingComponent$ = new ReplaySubject<QuizComponent>(1);
    quizResult$ = new Subject<QuizResult>();
    advanceQuizStage$ = new Subject();


    constructor() {
        this.advanceQuizStage$.pipe(
            withLatestFrom(this.quizzingComponent$)
        ).subscribe(([, currentDialogComponent]) => {
            switch (currentDialogComponent) {
                case Characters:
                    this.quizzingComponent$.next(Pictures)
                    break;
                case Pictures:
                    this.quizzingComponent$.next(Conclusion)
            }
        })
    }

    setQuizItem(icard: ICard | undefined) {
        this.quizzingCard$.next(icard);
        this.quizzingComponent$.next(icard ? Characters : undefined)
    }

    completeQuiz(word: string, recognitionScore: number) {
        this.quizResult$.next({
            score: recognitionScore,
            word
        })
        this.setQuizItem(undefined);
    }

}