import {BrowserInputs} from "../BrowserInputs";
import {QuizComponent, QuizManager} from "../QuizManager";
import {filter, withLatestFrom} from "rxjs/operators";
import {Characters} from "../../../components/Quiz/Characters";
import {Pictures} from "../../../components/Quiz/Pictures";
import {Conclusion} from "../../../components/Quiz/Conclusion";
import {Observable} from "rxjs";
import {RecognitionMap} from "../../Scheduling/SRM";

export function InputQuiz(i: BrowserInputs, q: QuizManager) {
    const advanceSet = new Set<QuizComponent>(["Characters", "Pictures"]);
    const conclusionSet = new Set<QuizComponent>(["Conclusion"]);
    const componentFilterPipe = (set: Set<QuizComponent>) => (o1$: Observable<any>): Observable<[KeyboardEvent, QuizComponent]> => o1$.pipe(
        withLatestFrom(q.quizStage),
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