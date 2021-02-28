import {BrowserInputs} from "../../hotkeys/browser-inputs";
import {QuizComponent, QuizManager} from "../QuizManager";
import {filter, withLatestFrom} from "rxjs/operators";
import {Observable} from "rxjs";
import {RecognitionMap} from "../../srm/srm.service";

export function InputQuiz(i: BrowserInputs, q: QuizManager) {
    const advanceSet = new Set<QuizComponent>([QuizComponent.Characters, QuizComponent.Conclusion]);
    const conclusionSet = new Set<QuizComponent>([QuizComponent.Conclusion]);

/*
    function submitQuizResult(key: string, difficulty: number) {
        i.getKeyDownSubject(key)
            .pipe(
                withLatestFrom(q.quizzingCard$)
            ).subscribe(([[event], item]) => {
            event.preventDefault();
            q.completeQuiz(item?.learningLanguage as string, difficulty)
        })
    }
*/


/*
    submitQuizResult('3', RecognitionMap.easy);
    submitQuizResult('2', RecognitionMap.medium);
    submitQuizResult('1', RecognitionMap.hard);
*/
}