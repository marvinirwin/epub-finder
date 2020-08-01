import {ScheduleManager} from "../ScheduleManager";
import {QuizManager} from "../QuizManager";
import {filter, map, startWith, withLatestFrom} from "rxjs/operators";
import CardManager from "../CardManager";
import {resolveICardForWord} from "../../Pipes/ResolveICardForWord";
import {ICard} from "../../Interfaces/ICard";
import {resolveICardForWords} from "../../Pipes/ResultICardForWords";

export function CardScheduleQuiz(c: CardManager, s: ScheduleManager, q: QuizManager) {
    q.currentQuizItem$.pipe(
        withLatestFrom(
            s.nextWordToQuiz$.pipe(
                resolveICardForWord<string | undefined, ICard | undefined>(c.cardIndex$)
            )
        )
    ).subscribe(([currentQuizItem, nextScheduledQuizItem]) => {
        if (!currentQuizItem && nextScheduledQuizItem) {
            q.currentQuizItem$.next(nextScheduledQuizItem)
        }
    })

    s.nextWordToQuiz$.pipe(resolveICardForWord<string | undefined, ICard | undefined>(c.cardIndex$))
        .pipe(withLatestFrom(q.currentQuizItem$.pipe(startWith(undefined))))
        .subscribe(([card, currentItem]) => {
            if (card && !currentItem) {
                q.currentQuizItem$.next(card)
            }
        })
}