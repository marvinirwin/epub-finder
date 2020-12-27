import {QuizManager} from "../Manager/QuizManager";
import {WordRecognitionProgressService} from "../schedule/word-recognition-progress.service";
import {QuizResultToRecognitionRows} from "../Pipes/QuizResultToRecognitionRows";
import {ScheduleService} from "../Manager/ScheduleService";
import {SrmService} from "../srm/srm.service";

export class QuizResultService {
    constructor({quizManager, wordRecognitionProgressService, scheduleManager, srmService}: {srmService: SrmService, scheduleManager: ScheduleService, quizManager: QuizManager, wordRecognitionProgressService: WordRecognitionProgressService}) {
        quizManager.quizResult$.pipe(
            QuizResultToRecognitionRows(scheduleManager.indexedScheduleRows$, srmService)
        ).subscribe(record => {
            wordRecognitionProgressService.addRecords$.next(record)
        });
    }
}