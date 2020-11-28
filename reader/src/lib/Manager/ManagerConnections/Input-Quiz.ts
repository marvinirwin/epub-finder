import {BrowserInputs} from "../../Hotkeys/BrowserInputs";
import {QuizComponent, QuizManager} from "../QuizManager";
import {filter, withLatestFrom} from "rxjs/operators";
import {Observable} from "rxjs";
import {RecognitionMap} from "../../srm/srm.service";

export function InputQuiz(i: BrowserInputs, q: QuizManager) {
    const advanceSet = new Set<QuizComponent>([QuizComponent.Characters, QuizComponent.Conclusion]);
    const conclusionSet = new Set<QuizComponent>([QuizComponent.Conclusion]);
    const componentFilterPipe = (set: Set<QuizComponent>) => (o1$: Observable<any>): Observable<[KeyboardEvent, QuizComponent]> => o1$.pipe(
        withLatestFrom(q.quizStage$),
        filter(([keydownEvent, component]) => {
            return set.has(component);
        }),
    );

    function submitQuizResult(key: string, difficulty: number) {
        i.getKeyDownSubject(key)
            .pipe(
                componentFilterPipe(conclusionSet),
                withLatestFrom(q.quizzingCard$)
            ).subscribe(([[event], item]) => {
            event.preventDefault();
            q.completeQuiz(item?.learningLanguage as string, difficulty)
        })
    }

    i.getKeyDownSubject(' ')
        .pipe(componentFilterPipe(advanceSet))
        .subscribe(([event]) => {
            event.preventDefault();
            q.advanceQuizStage$.next();
        });

    submitQuizResult('3', RecognitionMap.easy);
    submitQuizResult('2', RecognitionMap.medium);
    submitQuizResult('1', RecognitionMap.hard);
}