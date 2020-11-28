import {QuizManager} from "../Manager/QuizManager";
import {WordRecognitionProgressService} from "../schedule/word-recognition-progress.service";
import {QuizResultToRecognitionRows} from "../Pipes/QuizResultToRecognitionRows";
import {ScheduleManager} from "../Manager/ScheduleManager";
import {SrmService} from "../srm/srm.service";

export class QuizResultService {
    constructor({quizManager, wordRecognitionProgressService, scheduleManager, srmService}: {srmService: SrmService, scheduleManager: ScheduleManager, quizManager: QuizManager, wordRecognitionProgressService: WordRecognitionProgressService}) {
        quizManager.quizResult$.pipe(
            QuizResultToRecognitionRows(scheduleManager.indexedScheduleRows$, srmService)
        ).subscribe(record => {
            wordRecognitionProgressService.addWordRecognitionRecords$.next(record)
        });
    }
}