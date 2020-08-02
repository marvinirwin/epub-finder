import {ScheduleManager} from "../ScheduleManager";
import {QuizManager} from "../QuizManager";
import {filter, map, shareReplay, startWith, take, withLatestFrom} from "rxjs/operators";
import CardManager from "../CardManager";
import {resolveICardForWord} from "../../Pipes/ResolveICardForWord";
import {ICard} from "../../Interfaces/ICard";
import {combineLatest} from "rxjs";

export function CardScheduleQuiz(c: CardManager, s: ScheduleManager, q: QuizManager) {
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
    nextCardToQuiz$.pipe(
        withLatestFrom(q.quizzingCard$.pipe(startWith(undefined)))
    ).subscribe(([nextCardToQuiz, currentQuizItem]) => {
        if (!currentQuizItem && nextCardToQuiz) {
            q.setQuizItem(nextCardToQuiz);
        }
    })
}