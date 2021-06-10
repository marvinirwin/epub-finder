import { WordRecognitionProgressRepository } from '../schedule/word-recognition-progress.repository'
import { QuizResultToRecognitionRows } from '../pipes/QuizResultToRecognitionRows'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import React from 'react'
import { Subject } from 'rxjs'
import { SuperMemoGrade } from 'supermemo'
import { FlashCardType } from './hidden-quiz-fields'
import debug from 'debug';
const d = debug('quiz-result-service');

export interface QuizResult {
    word: string
    grade: SuperMemoGrade;
    language_code: string;
    flash_card_type: FlashCardType;
}


export class QuizResultService {
    quizResult$ = new Subject<QuizResult>()
    requestNextCard$ = new Subject<void>()
    constructor({
        wordRecognitionProgressRepository,
        scheduleRowsService,
    }: {
        scheduleRowsService: QuizCardScheduleRowsService
        wordRecognitionProgressRepository: WordRecognitionProgressRepository
    }) {
        this.quizResult$
            .pipe(
                QuizResultToRecognitionRows(
                    scheduleRowsService.scheduleRows$,
                ),
            )
            .subscribe((record) => {
                d(`${record.word}.${record.flash_card_type}.${record.grade}.${record.nextDueDate}`);
                /*
            generalToastMessageService.addToastMessage$.next(() => <Typography variant={'h6'}>
                {record.word} next due date {format(record.nextDueDate, "yyyy MMM-do HH:mm")}
            </Typography>)
*/
                wordRecognitionProgressRepository.addRecords$.next([record])
            })
    }
    completeQuiz(word: string, language_code: string, recognitionScore: SuperMemoGrade, flash_card_type: FlashCardType) {
        this.quizResult$.next({
            grade: recognitionScore,
            word,
            language_code,
            flash_card_type
        })

        this.requestNextCard$.next()
    }
}
