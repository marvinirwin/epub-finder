import {ScheduleService} from "../ScheduleService";
import {QuizManager} from "../QuizManager";
import CardService from "../CardService";

export function CardScheduleQuiz(c: CardService, s: ScheduleService, q: QuizManager) {
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

/*
    q.scheduledCards$.addObservable$.next(
        s.wordQuizList$.pipe(
            resolveICardForWords(c.cardIndex$),
        )
    );
    q.scheduledCards$.obs$.subscribe(args => {
        console.log();
    })
*/
}