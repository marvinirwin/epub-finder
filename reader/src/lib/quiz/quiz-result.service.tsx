import { WordRecognitionProgressRepository } from '../schedule/word-recognition-progress.repository'
import { QuizResultToRecognitionRows } from '../pipes/QuizResultToRecognitionRows'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { GeneralToastMessageService } from '../user-interface/general-toast-message.service'
import React from 'react'
import { Subject } from 'rxjs'
import { SuperMemoGrade } from 'supermemo'

export interface QuizResult {
    word: string
    grade: SuperMemoGrade;
    languageCode: string;
    hiddenFields: string[];
}

export enum QuizComponent {
    Conclusion = 'Conclusion',
    Characters = 'Characters',
}

export class QuizResultService {
    quizResult$ = new Subject<QuizResult>()
    requestNextCard$ = new Subject<void>()
    constructor({
        wordRecognitionProgressService,
        scheduleRowsService,
        generalToastMessageService,
    }: {
        scheduleRowsService: QuizCardScheduleRowsService
        wordRecognitionProgressService: WordRecognitionProgressRepository
        generalToastMessageService: GeneralToastMessageService
    }) {
        this.quizResult$
            .pipe(
                QuizResultToRecognitionRows(
                    scheduleRowsService.scheduleRows$,
                ),
            )
            .subscribe((record) => {
                /*
            generalToastMessageService.addToastMessage$.next(() => <Typography variant={'h6'}>
                {record.word} next due date {format(record.nextDueDate, "yyyy MMM-do HH:mm")}
            </Typography>)
*/
                wordRecognitionProgressService.addRecords$.next([record])
            })
    }
    completeQuiz(word: string,languageCode: string, recognitionScore: SuperMemoGrade, hiddenFields: string[]) {
        this.quizResult$.next({
            grade: recognitionScore,
            word,
            languageCode,
            hiddenFields
        })

        this.requestNextCard$.next()
    }
}
