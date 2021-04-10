import { SettingsService } from '../../services/settings.service'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { NormalizedQuizCardScheduleRowData, ScheduleRow } from '../schedule/schedule-row'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { TimeService } from '../time/time.service'
import { safePushMap } from '@shared/'
import { Dictionary, flatten, groupBy, orderBy } from 'lodash'
import { FlashCardType } from '../quiz/hidden-quiz-fields'

type LimitedScheduleRows = {
    wordsToReview: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    limitedScheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    wordsLearnedToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    wordsReviewingOrLearning: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    wordsLeftForToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
    unStartedWords: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
}

export const groupByWord = <T, U extends string>(rows: T[], cb: (r: T) => U): Dictionary<T[]> => {
    return groupBy(rows, cb)
}

export const gatherWhile = <T, U>(values: T[], filterFunc: (value: T) => boolean, limitReachedFunc: (gathered: T, acc: U) => boolean, acc: U): T[] => {
    const gatheredValues = []
    for (const value of values) {
        if (filterFunc(value)) {
            gatheredValues.push(value)
            if (limitReachedFunc(value, acc)) {
                return gatheredValues
            }
        }
    }
    return gatheredValues
}

export const gatherScheduleRows = (
    scheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[],
    filterFunc: (s: ScheduleRow<NormalizedQuizCardScheduleRowData>) => boolean,
    learningTargetLimit: number) => {
    const gathered: ScheduleRow<NormalizedQuizCardScheduleRowData>[] = []
    const learningTargetsFound = new Set<string>()
    for (const scheduleRow of scheduleRows) {
        if (learningTargetsFound.size >= learningTargetLimit) {

        }
    }
}

export const anyScheduleRowsForWord = (
    scheduleRowsToReview: ScheduleRow<NormalizedQuizCardScheduleRowData>[],
    quizCardFieldConfig: FlashCardType[],
) => {
    // A word is to review if any of its rows are too review
    return Object.values(groupBy(scheduleRowsToReview, row => row.d.word))
}

export const allScheduleRowsForWord = (
    unStartedScheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[],
    quizCardFieldConfig: FlashCardType[],
) => {
    /**
     * For a word to be unStarted, all of its schedule rows must be unStarted
     */
    return Object.values(groupBy(unStartedScheduleRows, row => row.d.word))
        .filter(scheduleRowsForOneWord => quizCardFieldConfig
            .every(flashCardType => scheduleRowsForOneWord
                .find(r => r.d.flashCardType === flashCardType),
            ),
        )
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
            settingsService.flashCardTypesRequiredToProgress$,
        ]).pipe(
            map(([sortedScheduleRows, newQuizWordLimit, now, flashCardTypesRequiredToProgress]) => {
                sortedScheduleRows = sortedScheduleRows.filter(
                    (row) => row.d.count.value > 0,
                )
                const scheduleRowsToReview = sortedScheduleRows.filter((r) => {
                    return r.isToReview({ now })
                })
                const scheduleRowsLearnedToday = sortedScheduleRows.filter((r) => {
                    return r.wasLearnedToday()
                })
                const learningScheduleRows = sortedScheduleRows.filter((r) =>
                    r.isLearning(),
                )
                const unStartedScheduleRows = sortedScheduleRows.filter(
                    (scheduleRow) => scheduleRow.isNotStarted(),
                )
                const scheduleRowsLeftForToday = flatten(Object.values(groupBy(unStartedScheduleRows, r => r.d.word)).slice(
                    0,
                    newQuizWordLimit - Object.values(groupBy(scheduleRowsLearnedToday, r => r.d.word)).length,
                ))
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

                const overDueRows = [...learningScheduleRows, ...scheduleRowsToReview].filter((r) => r.isOverDue({ now }))
                const notOverDueRows = [...learningScheduleRows, ...scheduleRowsToReview].filter((r) => !r.isOverDue({ now }))
                const adjustScheduleRows = (scheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[]) => spaceOutRows<ScheduleRow<NormalizedQuizCardScheduleRowData>, string, string>(
                    row => ({ type: row.d.word, subType: row.d.flashCardType, sortValue: row.dueDate().getTime() }),
                    scheduleRows,
                    1000 * 60 * 5, // 5 minutes
                )

                const overDueAdjustedSortValues = adjustScheduleRows(
                    sortedScheduleRows,
                )
                const notOverDueAdjustedSortValues = overDueAdjustedSortValues
                const wordsLeftForTodayAdjustedSortValues = overDueAdjustedSortValues
                return {
                    wordsToReview: scheduleRowsToReview,
                    wordsLearnedToday: scheduleRowsLearnedToday,
                    wordsLeftForToday: scheduleRowsLeftForToday,
                    wordsReviewingOrLearning: learningScheduleRows,
                    unStartedWords: unStartedScheduleRows,
                    limitedScheduleRows: [
                        ...orderBy(
                            overDueRows,
                            r => [overDueAdjustedSortValues.get(r), r.d.finalSortValue],
                            ['asc', 'desc'],
                        ),
                        ...(orderBy(
                            scheduleRowsLeftForToday,
                            [
                                r => wordsLeftForTodayAdjustedSortValues.get(r),
                                r => r.d.finalSortValue,
                            ],
                            ['asc', 'desc'],
                        )),
                        ...orderBy(
                            notOverDueRows,
                            r => [notOverDueAdjustedSortValues.get(r), r.d.finalSortValue],
                            ['asc', 'desc'],
                        ),
                    ],
                }
            }),
            distinctUntilChanged((x, y) => x.limitedScheduleRows.map(scheduleRowKey).join('') === y.limitedScheduleRows.map(scheduleRowKey).join('')),
            shareReplay(1),
        )

    }
}
