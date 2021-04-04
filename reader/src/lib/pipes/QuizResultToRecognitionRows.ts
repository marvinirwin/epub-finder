import { Observable } from 'rxjs'
import { map, withLatestFrom } from 'rxjs/operators'
import { quizCardNextDueDate, SrmService } from '../srm/srm.service'
import { WordRecognitionRow } from '../schedule/word-recognition-row'
import { QuizScheduleRowData, ScheduleRow } from '../schedule/schedule-row'
import { add } from 'date-fns'
import { QuizResult } from '../quiz/quiz-result.service'




export const QuizResultToRecognitionRows = (
    scheduleRows$: Observable<ScheduleRow<QuizScheduleRowData>[]>,
) => (quizResults$: Observable<QuizResult>) =>
    quizResults$.pipe(
        withLatestFrom(scheduleRows$),
        map(
            ([scorePair, scheduleRows]): WordRecognitionRow => {
                const sameWord = scheduleRows.filter(scheduleRow => scheduleRow.d.word === scorePair.word);
                const previousItems = sameWord.find(scheduleRow => scheduleRow.d.flashCardType === scorePair.flashCardType)?.d?.wordRecognitionRecords || []
                const nextRecognitionRecord = SrmService.getNextRecognitionRecord(
                    previousItems,
                    scorePair.grade,
                )


                return {
                    word: scorePair.word,
                    timestamp: new Date(),
                    ...nextRecognitionRecord,
                    nextDueDate: quizCardNextDueDate({grade: scorePair.grade, previousItems}),
                    grade: scorePair.grade,
                    flashCardType: scorePair.flashCardType,
                    languageCode: scorePair.languageCode,
                }
            },
        ),
    )
