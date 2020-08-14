import {combineLatest, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {Characters} from "../../components/Quiz/Characters";
import {debounce, debounceTime, filter, startWith, tap, withLatestFrom} from "rxjs/operators";
import {Pictures} from "../../components/Quiz/Pictures";
import {Conclusion} from "../../components/Quiz/Conclusion";

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

    setQuizItem$ = new Subject<ICard | undefined>();

    /*
        learningCards$ = new Subject<ScheduleRow[]>();
        toReviewCards$ = new Subject<ScheduleRow[]>();
        newCards$ = new Subject<ScheduleRow[]>();
    */

    constructor() {
        this.quizzingCard$.pipe(
            startWith(undefined),
            filter(card => card === undefined),
/*
            tap(() => {
                debugger;console.log();
            }),
*/
            withLatestFrom(this.scheduledCards$)
        ).subscribe(([quizzingCard, scheduledCards]: [ICard | undefined, ICard[]]) => {
            let iCard = scheduledCards[0];
            if (iCard) {
                this.setQuizItem$.next(iCard);
            }
        });

        combineLatest([
            this.quizzingCard$.pipe(startWith(undefined)),
            this.setQuizItem$.pipe(
                debounceTime(1)
            )
        ]).subscribe(([quizzingCard, setQuizItem]) => {
            if(!quizzingCard && setQuizItem) {
                this.setQuizItem(setQuizItem);
            }
        })

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
                this.setQuizItem$.next(iCard);
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
        this.setQuizItem$.next(undefined);
    }

}