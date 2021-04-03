import { Observable } from 'rxjs'
import { map, withLatestFrom } from 'rxjs/operators'
import { SrmService } from '../srm/srm.service'
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
                const previousRecords = sameWord.find(scheduleRow => scheduleRow.d.flashCardType === scorePair.flashCardType)?.d?.wordRecognitionRecords || []
                const nextRecognitionRecord = SrmService.getNextRecognitionRecord(
                    previousRecords,
                    scorePair.grade,
                )
                const inARow = <T>(
                    array: T[],
                    filterFunc: (v: T) => boolean,
                ): T[] => {
                    const sequencedElements = []
                    {
                        for (let i = 0; i < array.length; i++) {
                            const arrayElement = array[i]
                            if (!filterFunc(arrayElement)) {
                                return sequencedElements
                            }
                            sequencedElements.push(arrayElement)
                        }
                    }
                    return sequencedElements
                }

                const nextDueDate = () => {
                    if (scorePair.grade < 3) {
                        return add(Date.now(), { minutes: 1 })
                    }
                    const correctRecordsInARow = inARow(
                        previousRecords.reverse(),
                        (r) => r.grade >= 3,
                    )
                    switch (correctRecordsInARow.length) {
                        case 0:
                            return add(Date.now(), { minutes: 1 })
                        case 1:
                            return add(Date.now(), { minutes: 5 })
                        case 2:
                            return add(Date.now(), { minutes: 10 })
                        default:
                            return add(Date.now(), {
                                days: nextRecognitionRecord.interval,
                            })
                    }
                }

                return {
                    word: scorePair.word,
                    timestamp: new Date(),
                    ...nextRecognitionRecord,
                    nextDueDate: nextDueDate(),
                    grade: scorePair.grade,
                    flashCardType: scorePair.flashCardType,
                    languageCode: scorePair.languageCode,
                }
            },
        ),
    )
