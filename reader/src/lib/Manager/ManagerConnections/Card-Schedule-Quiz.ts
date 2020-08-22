import {ScheduleManager} from "../ScheduleManager";
import {QuizManager} from "../QuizManager";
import CardManager from "../CardManager";
import {resolveICardForWords} from "../../Pipes/ResultICardForWords";
import {map, tap} from "rxjs/operators";

export function CardScheduleQuiz(c: CardManager, s: ScheduleManager, q: QuizManager) {
/*
    let nextCardToQuiz$ = s.nextWordToQuiz$.pipe(
        startWith(undefined),
        resolveICardForWord<string | undefined, ICard | undefined>(c.cardIndex$),
        shareReplay(1),
    );
    q.quizzingCard$.pipe(withLatestFrom(nextCardToQuiz$)).subscribe(([currentQuizItem, nextCardToQuiz]) => {
        if (!currentQuizItem && nextCardToQuiz) {
            q.setQuizItem(nextCardToQuiz);
        }
    });
*/
/*
    nextCardToQuiz$.pipe(
        withLatestFrom(q.quizzingCard$.pipe(startWith(undefined)))
    ).subscribe(([nextCardToQuiz, currentQuizItem]) => {
        if (!currentQuizItem && nextCardToQuiz) {
            q.setQuizItem(nextCardToQuiz);
        }
    });
*/

    q.scheduledCards$.addObservable$.next(
        s.wordQuizList$.pipe(
            tap(args => {
                console.log();
            }),
            resolveICardForWords(c.cardIndex$),
            tap(args => {
                console.log();
            }),
        )
    );
    q.scheduledCards$.obs$.subscribe(args => {
        console.log();
    })
}