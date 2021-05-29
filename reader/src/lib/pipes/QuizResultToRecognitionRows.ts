import { Observable } from 'rxjs'
import { map, withLatestFrom } from 'rxjs/operators'
import { quizCardNextDueDate, SrmService } from '../srm/srm.service'
import { WordRecognitionRow } from '../schedule/word-recognition-row'
import { QuizScheduleRowData, ScheduleRow } from '../schedule/schedule-row'
import { add } from 'date-fns'
import { QuizResult } from '../quiz/quiz-result.service'
import { PotentialExcludedDbColumns } from '../schedule/indexed-rows.repository'




export const QuizResultToRecognitionRows = (
    scheduleRows$: Observable<ScheduleRow<QuizScheduleRowData>[]>,
) => (quizResults$: Observable<QuizResult>) =>
    quizResults$.pipe(
        withLatestFrom(scheduleRows$),
        map(
            ([scorePair, scheduleRows]): PotentialExcludedDbColumns<WordRecognitionRow> => {
                const sameWord = scheduleRows.filter(scheduleRow => scheduleRow.d.word === scorePair.word);
                const previousItems = sameWord.find(scheduleRow => scheduleRow.d.flash_card_type === scorePair.flash_card_type)?.d?.wordRecognitionRecords || []
                const nextRecognitionRecord = SrmService.getNextRecognitionRecord(
                    previousItems,
                    scorePair.grade,
                )


                return {
                    word: scorePair.word,
                    created_at: new Date(),
                    ...nextRecognitionRecord,
                    nextDueDate: quizCardNextDueDate({grade: scorePair.grade, previousItems}),
                    grade: scorePair.grade,
                    flash_card_type: scorePair.flash_card_type,
                    language_code: scorePair.language_code,
                }
            },
        ),
    )
