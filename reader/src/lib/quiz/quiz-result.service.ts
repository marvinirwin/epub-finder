import {QuizManager} from "../Manager/QuizManager";
import {WordRecognitionProgressService} from "../schedule/word-recognition-progress.service";
import {QuizResultToRecognitionRows} from "../Pipes/QuizResultToRecognitionRows";
import {ScheduleService} from "../Manager/schedule.service";
import {SrmService} from "../srm/srm.service";
import {ScheduleRowsService} from "../Manager/schedule-rows.service";

export class QuizResultService {
    constructor({
                    quizManager,
                    wordRecognitionProgressService,
                    scheduleRowsService,
                    srmService
                }: {
        srmService: SrmService,
        scheduleRowsService: ScheduleRowsService,
        quizManager: QuizManager,
        wordRecognitionProgressService: WordRecognitionProgressService
    }) {
        quizManager.quizResult$.pipe(
            QuizResultToRecognitionRows(scheduleRowsService.indexedScheduleRows$, srmService)
        ).subscribe(record => {
            wordRecognitionProgressService.addRecords$.next(record)
        });
    }
}