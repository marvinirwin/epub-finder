import {ScheduleManager} from "../ScheduleManager";
import {QuizManager} from "../QuizManager";
import {filter, map, shareReplay, startWith, withLatestFrom} from "rxjs/operators";
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
    combineLatest([
        nextCardToQuiz$,
        q.currentQuizItem$.pipe(startWith(undefined))
    ]).subscribe(([nextScheduledQuizItem, currentQuizItem]) => {
        if (!currentQuizItem && nextScheduledQuizItem) {
            q.currentQuizItem$.next(nextScheduledQuizItem)
        }
    })
}