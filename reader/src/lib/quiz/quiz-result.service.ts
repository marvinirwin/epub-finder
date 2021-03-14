import {QuizManager} from "../manager/QuizManager";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {QuizResultToRecognitionRows} from "../pipes/QuizResultToRecognitionRows";
import {SrmService} from "../srm/srm.service";
import {QuizCardScheduleRowsService} from "../schedule/quiz-card-schedule-rows.service";
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
        scheduleRowsService: QuizCardScheduleRowsService,
        quizManager: QuizManager,
        wordRecognitionProgressService: WordRecognitionProgressRepository,
        alertsService: AlertsService,
    }) {
        quizManager.quizResult$.pipe(
            QuizResultToRecognitionRows(scheduleRowsService.indexedScheduleRows$, srmService)
        ).subscribe(record => {
/*
            alertsService.info(`You'll review this card in ${humanizeDuration(record.nextDueDate.getTime() - new Date().getTime())}`)
*/
            wordRecognitionProgressService.addRecords$.next([ record ])
        });
    }
}