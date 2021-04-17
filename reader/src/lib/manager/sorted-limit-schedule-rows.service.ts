import { SettingsService } from '../../services/settings.service'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { ScheduleRow, SortQuizData, SpacedSortQuizData } from '../schedule/schedule-row'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { TimeService } from '../time/time.service'
import { Dictionary, flatten, groupBy, orderBy } from 'lodash'
import { FlashCardType } from '../quiz/hidden-quiz-fields'

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
    scheduleRows: ScheduleRow<SortQuizData>[],
    quizCardFieldConfig: FlashCardType[],
) => {
    /**
     * For a word to be unStarted, all of its schedule rows must be unStarted
     */
    return Object.values(groupBy(scheduleRows, row => row.d.word))
        .filter(scheduleRowsForOneWord => {
            return quizCardFieldConfig.every(flashCardType => {
                return scheduleRowsForOneWord.find(r => r.d.flashCardType === flashCardType)
            })
        })
}

export const scheduleRowKey = (r: ScheduleRow<SpacedSortQuizData>) => `${r.d.word}${r.d.flashCardType}${r.d.wordRecognitionRecords.length}`

const getSiblingRecords = (learningScheduleRows: SpacedScheduleRow[], unStartedScheduleRows: SpacedScheduleRow[]) => flatten(learningScheduleRows.map(learningScheduleRow => unStartedScheduleRows.filter(unStartedScheduleRow => unStartedScheduleRow.d.word === learningScheduleRow.d.word)))

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
                const scheduleRowsLearnedOrReviewedToday = sortedScheduleRows.filter((r) => {
                    return r.wasLearnedToday()
                })
                const learningScheduleRows = sortedScheduleRows.filter((r) =>
                    r.isLearning(),
                )
                const unStartedScheduleRows = sortedScheduleRows.filter(
                    (scheduleRow) => scheduleRow.isNotStarted(),
                );
                const scheduleRowsLearnedForTheFirstTimeToday = sortedScheduleRows.filter(r => r.wasLearnedForTheFirstTimeToday());
                const unStartedSiblingsWhichShouldBe =[
                    ...getSiblingRecords(learningScheduleRows, unStartedScheduleRows),
                    ...getSiblingRecords(scheduleRowsLearnedOrReviewedToday, unStartedScheduleRows)
                ];
                const unStartedWords = Object.values(groupBy(unStartedScheduleRows.filter(r => !unStartedSiblingsWhichShouldBe.includes(r)), r => r.d.word))
                const learningWords = Object.keys(groupBy(learningScheduleRows, r => r.d.word))
                const wordsLearnedForTheFirstTime = Object.keys(groupBy(scheduleRowsLearnedForTheFirstTimeToday, r => r.d.word))
                const scheduleRowsLeftForToday = flatten(unStartedWords.slice(
                    0,
                    newQuizWordLimit - new Set([...learningWords, ...wordsLearnedForTheFirstTime]).size,
                ))
                const overDueRows = [...learningScheduleRows, ...scheduleRowsToReview, ...unStartedSiblingsWhichShouldBe].filter((r) => r.isOverDue({ now }))
                const notOverDueRows = [...learningScheduleRows, ...scheduleRowsToReview, ...unStartedSiblingsWhichShouldBe].filter((r) => !r.isOverDue({ now }))

                const iteratees = [
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.spacedDueDate.transformed,
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.finalSortValue,
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.word,
                ]
                const orders: ('asc' | 'desc')[] = ['asc', 'desc', 'asc']
                const orderFunc = (rows: SpacedScheduleRow[]) => orderBy(rows, iteratees, orders);
                return {
                    wordsToReview: orderFunc(scheduleRowsToReview),
                    wordsLearnedToday: orderFunc(scheduleRowsLearnedOrReviewedToday),
                    wordsLeftForToday: orderFunc(scheduleRowsLeftForToday),
                    wordsReviewingOrLearning: orderFunc([...learningScheduleRows, ...unStartedSiblingsWhichShouldBe]),
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
