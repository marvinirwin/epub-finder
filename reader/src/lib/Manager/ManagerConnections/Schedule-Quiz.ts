import {ScheduleManager} from "../ScheduleManager";
import {QuizManager} from "../QuizManager";
import {map} from "rxjs/operators";
import {resolveICardForWords} from "../../Pipes/ResultICardForWords";
import {QuizResultToRecognitionRow} from "../../Pipes/QuizResultToRecognitionRow";
import {resolveICardForWord} from "../../Pipes/ResolveICardForWord";

export function ScheduleQuiz(s: ScheduleManager, q: QuizManager) {
    q.completedQuizItem$.pipe(
        QuizResultToRecognitionRow(s.wordScheduleRowDict$, s.ms)
    ).subscribe(s.addUnpersistedWordRecognitionRows$);
}