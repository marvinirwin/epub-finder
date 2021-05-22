import { WordRecognitionProgressRepository } from '../schedule/word-recognition-progress.repository'
import { QuizResultToRecognitionRows } from '../pipes/QuizResultToRecognitionRows'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { GeneralToastMessageService } from '../user-interface/general-toast-message.service'
import React from 'react'
import { Subject } from 'rxjs'
import { SuperMemoGrade } from 'supermemo'
import { FlashCardType } from './hidden-quiz-fields'

export interface QuizResult {
    word: string
    grade: SuperMemoGrade;
    language_code: string;
    flash_card_type: string;
}


export class QuizResultService {
    quizResult$ = new Subject<QuizResult>()
    requestNextCard$ = new Subject<void>()
    constructor({
        wordRecognitionProgressRepository,
        scheduleRowsService,
        generalToastMessageService,
    }: {
        scheduleRowsService: QuizCardScheduleRowsService
        wordRecognitionProgressRepository: WordRecognitionProgressRepository
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
                wordRecognitionProgressRepository.addRecords$.next([record])
            })
    }
    completeQuiz(word: string,language_code: string, recognitionScore: SuperMemoGrade, flash_card_type: FlashCardType) {
        this.quizResult$.next({
            grade: recognitionScore,
            word,
            language_code,
            flash_card_type
        })

        this.requestNextCard$.next()
    }
}
