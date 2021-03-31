import { Observable } from 'rxjs'
import { Dictionary } from 'lodash'
import { map, withLatestFrom } from 'rxjs/operators'
import { SrmService } from '../srm/srm.service'
import { WordRecognitionRow } from '../schedule/word-recognition-row'
import moment from 'moment'
import { QuizScheduleRowData, ScheduleRow } from '../schedule/schedule-row'
import { add } from 'date-fns'
import { QuizResult } from '../quiz/quiz-result.service'

export const QuizResultToRecognitionRows = (
    scheduleRows$: Observable<Dictionary<ScheduleRow<QuizScheduleRowData>>>,
) => (quizResults$: Observable<QuizResult>) =>
    quizResults$.pipe(
        withLatestFrom(scheduleRows$),
        map(
            ([scorePair, wordScheduleRowDict]): WordRecognitionRow => {
                const previousRecords =
                    wordScheduleRowDict[scorePair.word]?.d
                        .wordRecognitionRecords || []
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
                    hiddenFields: [],
                    languageCode: scorePair.languageCode
                }
            },
        ),
    )
