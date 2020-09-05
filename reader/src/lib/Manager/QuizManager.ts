import {Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {Characters} from "../../components/Quiz/Characters";
import { startWith, withLatestFrom} from "rxjs/operators";
import {Pictures} from "../../components/Quiz/Pictures";
import {Conclusion} from "../../components/Quiz/Conclusion";

export interface QuizResult {
    word: string;
    score: number;
}

export type QuizComponent = string;

export interface QuizManagerParams {
    scheduledCards$: Observable<ICard[]>;
}

export class QuizManager {
    quizzingCard$ = new ReplaySubject<ICard | undefined>(1);
    quizzingComponent$ = new ReplaySubject<QuizComponent>(1);
    quizResult$ = new Subject<QuizResult>();
    advanceQuizStage$ = new Subject();

    scheduledCards$: Observable<ICard[]>;

    requestNextCard$ = new Subject<void>();

    constructor({scheduledCards$}: QuizManagerParams) {
        this.scheduledCards$ = scheduledCards$;
        this.quizzingCard$.subscribe(() => {
            console.log();
        })
        this.quizzingCard$.pipe(
            startWith(undefined),
            withLatestFrom(this.scheduledCards$)
        ).subscribe(([quizzingCard, scheduledCards]: [ICard | undefined, ICard[]]) => {
            if (!quizzingCard && scheduledCards[0]) {
                this.requestNextCard$.next();
            }
        });

        this.requestNextCard$.pipe(
            withLatestFrom(this.scheduledCards$)
        ).subscribe(([_, scheduledCards]) => {
            this.quizzingCard$.next(scheduledCards[0]);
            this.quizzingComponent$.next("Characters");
        })

/*
        combineLatest([
            this.quizzingCard$.pipe(startWith(undefined)),
            this.requestNextCard$.pipe(
                debounceTime(1)
            )
        ]).subscribe(([quizzingCard, setQuizItem]) => {
            if(!quizzingCard && setQuizItem) {
                this.requestNextCard$.next();
            }
        })
*/

        this.scheduledCards$.pipe(
            withLatestFrom(
                this.quizzingCard$.pipe(
                    startWith(undefined),
                )
            ),
        ).subscribe(([scheduledCards, quizzingCard]) => {
            if (!quizzingCard && scheduledCards[0]) {
                this.requestNextCard$.next();
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

    setQuizCard(icard: ICard | undefined) {
        this.quizzingCard$.next(icard);
        this.quizzingComponent$.next("Characters")
    }

    completeQuiz(word: string, recognitionScore: number) {
        this.quizResult$.next({
            score: recognitionScore,
            word
        });
        this.requestNextCard$.next()
    }

}