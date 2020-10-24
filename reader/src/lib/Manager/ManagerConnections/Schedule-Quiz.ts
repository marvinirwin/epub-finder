import {ScheduleManager} from "../ScheduleManager";
import {QuizManager} from "../QuizManager";
import {QuizResultToRecognitionRows} from "../../Pipes/QuizResultToRecognitionRows";

export function ScheduleQuiz(s: ScheduleManager, q: QuizManager) {
    q.quizResult$.pipe(
        QuizResultToRecognitionRows(s.indexedScheduleRows$, s.spacedRepitionManager)
    ).subscribe(record => {
        s.addWordRecognitionRecords$.next(record)
    });
}