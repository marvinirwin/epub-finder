import {QuizManager} from "../manager/QuizManager";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {QuizResultToRecognitionRows} from "../pipes/QuizResultToRecognitionRows";
import {QuizCardScheduleRowsService} from "../schedule/quiz-card-schedule-rows.service";
import {GeneralToastMessageService} from "../general-toast-message.service";
import React from "react";

export class QuizResultService {
    constructor({
                    quizManager,
                    wordRecognitionProgressService,
                    scheduleRowsService,
                    generalToastMessageService
                }: {
        scheduleRowsService: QuizCardScheduleRowsService,
        quizManager: QuizManager,
        wordRecognitionProgressService: WordRecognitionProgressRepository,
        generalToastMessageService: GeneralToastMessageService,
    }) {
        quizManager.quizResult$.pipe(
            QuizResultToRecognitionRows(scheduleRowsService.indexedScheduleRows$)
        ).subscribe(record => {
/*
            generalToastMessageService.addToastMessage$.next(() => <Typography variant={'h6'}>
                {record.word} next due date {format(record.nextDueDate, "yyyy MMM-do HH:mm")}
            </Typography>)
*/
            wordRecognitionProgressService.addRecords$.next([ record ])
        });
    }
}