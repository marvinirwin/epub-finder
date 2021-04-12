import { SettingsService } from '../../services/settings.service'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { ScheduleRow, SortQuizData, SpacedSortQuizData } from '../schedule/schedule-row'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { TimeService } from '../time/time.service'
import { Dictionary, flatten, groupBy, orderBy } from 'lodash'
import { FlashCardType } from '../quiz/hidden-quiz-fields'
import { spaceOutRows } from '../schedule/space-out-rows'

export type SpacedScheduleRow = ScheduleRow<SpacedSortQuizData>;

type LimitedScheduleRows = {
    wordsToReview: SpacedScheduleRow[];
    limitedScheduleRows: SpacedScheduleRow[];
    wordsLearnedToday: SpacedScheduleRow[];
    wordsReviewingOrLearning: SpacedScheduleRow[];
    wordsLeftForToday: SpacedScheduleRow[];
    unStartedWords: SpacedScheduleRow[];
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

export const anyScheduleRowsForWord = (
    scheduleRowsToReview: ScheduleRow<SpacedSortQuizData>[],
    quizCardFieldConfig: FlashCardType[],
) => {
    // A word is to review if any of its rows are too review
    return Object.values(groupBy(scheduleRowsToReview, row => row.d.word))
}

export const allScheduleRowsForWord = (
    unStartedScheduleRows: ScheduleRow<SortQuizData>[],
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

export const scheduleRowKey = (r: ScheduleRow<SpacedSortQuizData>) => `${r.d.word}${r.d.flashCardType}${r.d.wordRecognitionRecords.length}`

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
            map(([sortedScheduleRows, newQuizWordLimit, now]: [SpacedScheduleRow[], number, Date]) => {
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
                const unStartedWords = Object.values(groupBy(unStartedScheduleRows, r => r.d.word))
                const learningWords = Object.keys(groupBy(learningScheduleRows, r => r.d.word))
                const finishedWords = Object.keys(groupBy(scheduleRowsLearnedToday, r => r.d.word))
                const scheduleRowsLeftForToday = flatten(unStartedWords.slice(
                    0,
                    newQuizWordLimit - new Set([...finishedWords, ...learningWords]).size,
                ))
                /**
                 * I want a function which is given a list of {type, subType, orderValue}
                 * returns a new orderValue so that its less likely that a given type or subType will occur near each other
                 */

                const overDueRows = [...learningScheduleRows, ...scheduleRowsToReview].filter((r) => r.isOverDue({ now }))
                const notOverDueRows = [...learningScheduleRows, ...scheduleRowsToReview].filter((r) => !r.isOverDue({ now }))

                const iteratees = [
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.spacedDueDate.transformed,
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.finalSortValue,
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.word,
                ]
                const orders: ('asc' | 'desc')[] = ['asc', 'desc', 'asc']
                const orderFunc = (rows: SpacedScheduleRow[]) => orderBy(rows, iteratees, orders);
                return {
                    wordsToReview: orderFunc(scheduleRowsToReview),
                    wordsLearnedToday: orderFunc(scheduleRowsLearnedToday),
                    wordsLeftForToday: orderFunc(scheduleRowsLeftForToday),
                    wordsReviewingOrLearning: orderFunc(learningScheduleRows),
                    unStartedWords: orderFunc(unStartedScheduleRows),
                    limitedScheduleRows: [
                        ...orderFunc(overDueRows),
                        ...orderFunc(scheduleRowsLeftForToday),
                        ...orderFunc(notOverDueRows),
                    ],
                }
            }),
            distinctUntilChanged((x, y) => x.limitedScheduleRows.map(scheduleRowKey).join('') === y.limitedScheduleRows.map(scheduleRowKey).join('')),
            shareReplay(1),
        )

    }
}
