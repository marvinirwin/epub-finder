import { SettingsService } from '../../services/settings.service'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
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
        const scheduleRowKey = (r: ScheduleRow<NormalizedQuizCardScheduleRowData>) => `${r.d.word}${r.d.flashCardType}`
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
                            const { type } = resolveTypes(value)
                            // @ts-ignore
                            safePushMap(typeMap, type, value)
                        },
                    )
                    const newOrderingMap = new Map<T, number>()
                    typeMap.forEach((rows, type) => {
                        let previousValue: undefined | number
                        rows.forEach(row => {
                            // tslint:disable-next-line:no-shadowed-variable
                            const { sortValue, type } = resolveTypes(row)
                            if (previousValue === undefined) {
                                previousValue = sortValue
                            } else if ((previousValue + sortValueOffset) > sortValue) {
                                previousValue = previousValue + sortValueOffset
                            } else {
                                previousValue = sortValue
                            }
                            newOrderingMap.set(row, previousValue)
                        })
                    })
                    return newOrderingMap
                }

                const overDueRows = [...learning, ...wordsToReview].filter((r) => r.isOverDue({ now }))
                const notOverDueRows = [...learning, ...wordsToReview].filter((r) => !r.isOverDue({ now }))
                const adjustScheduleRows = (scheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[]) => spaceOutRows<ScheduleRow<NormalizedQuizCardScheduleRowData>, string, string>(
                    row => ({ type: row.d.word, subType: row.d.flashCardType, sortValue: row.dueDate().getTime() }),
                    scheduleRows,
                    1000 * 60 * 5, // 5 minutes
                )

                const overDueAdjustedSortValues = adjustScheduleRows(orderBy(sortedScheduleRows, r => `${r.d.word}${r.d.flashCardType}`))
                const notOverDueAdjustedSortValues = overDueAdjustedSortValues
                const wordsLeftForTodayAdjustedSortValues = overDueAdjustedSortValues
                return {
                    wordsToReview,
                    wordsLearnedToday,
                    wordsLeftForToday,
                    wordsReviewingOrLearning: learning,
                    unStartedWords,
                    limitedScheduleRows: [
                        ...orderBy(overDueRows, r => overDueAdjustedSortValues.get(r)),
                        ...orderBy(wordsLeftForToday, r => wordsLeftForTodayAdjustedSortValues.get(r)),
                        ...orderBy(notOverDueRows, r => notOverDueAdjustedSortValues.get(r)),
                    ],
                }
            }),
            distinctUntilChanged((x, y) => x.limitedScheduleRows.map(scheduleRowKey).join('') === y.limitedScheduleRows.map(scheduleRowKey).join('')),
            shareReplay(1),
        )

    }
}
