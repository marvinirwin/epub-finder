import {QuizManager} from "../Manager/QuizManager";
import {WordRecognitionProgressService} from "../schedule/word-recognition-progress.service";
import {QuizResultToRecognitionRows} from "../Pipes/QuizResultToRecognitionRows";
import {SrmService} from "../srm/srm.service";
import {ScheduleRowsService} from "../Manager/schedule-rows.service";
import {AlertsService} from "../../services/alerts.service";
import humanizeDuration from 'humanize-duration';

export class QuizResultService {
    constructor({
                    quizManager,
                    wordRecognitionProgressService,
                    scheduleRowsService,
                    srmService,
        alertsService
                }: {
        srmService: SrmService,
        scheduleRowsService: ScheduleRowsService,
        quizManager: QuizManager,
        wordRecognitionProgressService: WordRecognitionProgressService,
        alertsService: AlertsService,
    }) {
        quizManager.quizResult$.pipe(
            QuizResultToRecognitionRows(scheduleRowsService.indexedScheduleRows$, srmService)
        ).subscribe(record => {
            alertsService.info(`You'll review this card in ${humanizeDuration(record.nextDueDate.getTime() - new Date().getTime())}`)
            wordRecognitionProgressService.addRecords$.next([ record ])
        });
    }
}