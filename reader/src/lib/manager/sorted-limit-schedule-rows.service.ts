import { SettingsService } from '../../services/settings.service'
import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { NormalizedQuizCardScheduleRowData, ScheduleRow } from '../schedule/schedule-row'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { TimeService } from '../time/time.service'
import { safePushMap } from '@shared/'
import { orderBy } from 'lodash'

type LimitedScheduleRows = {
    wordsToReview: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    limitedScheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    wordsLearnedToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    wordsReviewingOrLearning: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    wordsLeftForToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    unStartedWords: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
}

export class SortedLimitScheduleRowsService {
    sortedLimitedScheduleRows$: Observable<LimitedScheduleRows>

    constructor({
                    settingsService,
                    quizCardScheduleRowsService,
                    timeService,
                }: {
        settingsService: SettingsService
        quizCardScheduleRowsService: QuizCardScheduleRowsService
        timeService: TimeService
    }) {
        this.sortedLimitedScheduleRows$ = combineLatest([
            quizCardScheduleRowsService.scheduleRows$,
            settingsService.newQuizWordLimit$,
            timeService.quizNow$,
        ]).pipe(
            map(([sortedScheduleRows, newQuizWordLimit, now]) => {
                sortedScheduleRows = sortedScheduleRows.filter(
                    (row) => row.d.count.value > 0,
                )
                const wordsToReview = sortedScheduleRows.filter((r) => {
                    return r.isToReview({ now })
                })
                const wordsLearnedToday = sortedScheduleRows.filter((r) => {
                    return r.wasLearnedToday()
                })
                const learning = sortedScheduleRows.filter((r) =>
                    r.isLearning(),
                )
                const unStartedWords = sortedScheduleRows.filter(
                    (scheduleRow) => scheduleRow.isNotStarted(),
                )
                const wordsLeftForToday = unStartedWords.slice(
                    0,
                    newQuizWordLimit - wordsLearnedToday.length,
                )
                /**
                 * I want a function which is given a list of {type, subType, orderValue}
                 * returns a new orderValue so that its less likely that a given type or subType will occur near each other
                 */
                const spaceOutRows = <T, U, V>(
                    resolveTypes: (v: T) => {
                        type: U,
                        subType: V,
                        sortValue: number
                    },
                    values: T[],
                    sortValueOffset: number,
                ) => {
                    const typeMap = new Map<U, T[]>()
                    values.forEach(value => {
                            const r = resolveTypes(value)
                            safePushMap(typeMap, r.type, value)
                        },
                    )
                    const newOrderingMap = new Map<T, number>()
                    typeMap.forEach((rows, type) => {
                        let startValue: undefined | number
                        rows.forEach(row => {
                            const { sortValue } = resolveTypes(row)
                            if (startValue === undefined) {
                                startValue = sortValue
                            } else {
                                startValue = sortValue + sortValueOffset
                            }
                            newOrderingMap.set(row, startValue)
                        })
                    })
                    return newOrderingMap
                }

                const overDue = [...learning, ...wordsToReview].filter((r) => r.isOverDue({ now }))
                const notOverDue = [...learning, ...wordsToReview].filter((r) => !r.isOverDue({ now }))
                const adjustScheduleRows = (scheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[]) => spaceOutRows<ScheduleRow<NormalizedQuizCardScheduleRowData>, string, string>(
                    row => ({ type: row.d.word, subType: row.d.flashCardType, sortValue: row.dueDate().getTime() }),
                    scheduleRows,
                    1000 * 60 * 5, // 5 minutes
                )

                const overDueAdjustedSortValues = adjustScheduleRows(overDue)
                const notOverDueAdjustedSortValues = adjustScheduleRows(notOverDue)
                const wordsLeftForTodayAdjustedSortValues = adjustScheduleRows(wordsLeftForToday)
                return {
                    wordsToReview,
                    wordsLearnedToday,
                    wordsLeftForToday,
                    wordsReviewingOrLearning: learning,
                    unStartedWords,
                    limitedScheduleRows: [
                        ...orderBy(overDue, r => overDueAdjustedSortValues.get(r)),
                        ...orderBy(wordsLeftForToday, r => wordsLeftForTodayAdjustedSortValues.get(r)),
                        ...orderBy(notOverDue, r => notOverDueAdjustedSortValues.get(r)),
                    ],
                }
            }),
            shareReplay(1),
        )
    }
}
