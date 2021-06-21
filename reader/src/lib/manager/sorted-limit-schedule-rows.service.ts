import { observableLastValue, SettingsService } from '../../services/settings.service'
import { combineLatest, Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { ScheduleRow, SortQuizData, SpacedSortQuizData } from '../schedule/schedule-row'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { TimeService } from '../time/time.service'
import { Dictionary, flatten, groupBy, orderBy, uniq } from 'lodash'
import { FlashCardType } from '../quiz/hidden-quiz-fields'
import { isToday } from 'date-fns'
import { pipeLog } from './pipe.log'
import { KnownWordsRepository } from '../schedule/known-words.repository'
import { tapCacheScheduleRowImages } from './image-cache'
import CardsRepository from './cards.repository'

export type SpacedScheduleRow = ScheduleRow<SpacedSortQuizData>;

export type LimitedScheduleRows = {
    scheduleRowsLeftForToday: SpacedScheduleRow[]
    wordsToReview: SpacedScheduleRow[];
    limitedScheduleRows: SpacedScheduleRow[];
    wordsLearnedToday: SpacedScheduleRow[];
    wordsReviewedToday: SpacedScheduleRow[];
    wordsLearning: SpacedScheduleRow[];
    wordsLeftForToday: SpacedScheduleRow[];
    unStartedWords: SpacedScheduleRow[];
    debug: {
        limitedScheduleRows: {
            overDueRows: ScheduleRow<SpacedSortQuizData>[]
            scheduleRowsLeftForToday: ScheduleRow<SpacedSortQuizData>[]
            notOverDueRows: ScheduleRow<SpacedSortQuizData>[]
        }
    },
}

export const groupByWord = <listItemType, itemKeyType extends string>(rows: listItemType[], keyExtractionFunction: (r: listItemType) => itemKeyType): Dictionary<listItemType[]> => {
    return groupBy(rows, keyExtractionFunction)
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

export const allScheduleRowsForWordToday = (
    {
        scheduleRows,
        allScheduleRows,
    }:
        {
            scheduleRows: ScheduleRow<SortQuizData>[],
            allScheduleRows: ScheduleRow<SortQuizData>[]
        },
) => {
    // So we take all the schedule rows which are due today and then apply the evewry function
    /**
     * For a word to be unStarted, all of its schedule rows must be unStarted for that day
     */
    const selectScheduleRowsGrouped = groupBy(scheduleRows, r => r.d.word)
    const allScheduleRowsGrouped = groupBy(allScheduleRows, r => r.d.word)
    const selectEntriesGrouped = Object.entries(selectScheduleRowsGrouped)
    const filteredItems = []
    for (const [word, rows] of selectEntriesGrouped) {
        const allScheduleRowEntries = allScheduleRowsGrouped[word]?.filter(r => isToday(r.dueDate()))
        const allRowsComplete = allScheduleRowEntries.length === rows.length
        if (allRowsComplete) {
            filteredItems.push(rows)
        }
    }
    return filteredItems
}

export const scheduleRowKey = (r: ScheduleRow<SpacedSortQuizData>) => `${r.d.word}${r.d.flash_card_type}${r.d.wordRecognitionRecords.length}`

const getSiblingRecords = (learningScheduleRows: SpacedScheduleRow[], unStartedScheduleRows: SpacedScheduleRow[]) =>
    flatten(learningScheduleRows
        .map(learningScheduleRow => unStartedScheduleRows
            .filter(unStartedScheduleRow => unStartedScheduleRow.d.word === learningScheduleRow.d.word),
        ),
    )


export class SortedLimitScheduleRowsService {
    sortedLimitedScheduleRows$: Observable<LimitedScheduleRows>

    constructor({
                    settingsService,
                    quizCardScheduleRowsService,
                    timeService,
                    knownWordsRepository,
        cardsRepository
                }: {
        settingsService: SettingsService
        quizCardScheduleRowsService: QuizCardScheduleRowsService
        timeService: TimeService
        knownWordsRepository: KnownWordsRepository
        cardsRepository: CardsRepository
    }) {
        this.sortedLimitedScheduleRows$ = combineLatest([
            quizCardScheduleRowsService.scheduleRows$.pipe(pipeLog('sorted-limited:scheduleRows')),
            settingsService.newQuizWordLimit$.pipe(pipeLog('sorted-limited:newQuizWordLimit')),
            timeService.quizNow$.pipe(pipeLog('sorted-limited:quizNow')),
            knownWordsRepository.indexOfOrderedRecords$,
        ]).pipe(
            debounceTime(0),
            map(([sortedScheduleRows, newQuizWordLimit, now, knownWordsIndex]) => {
                sortedScheduleRows = sortedScheduleRows.filter(
                    (row) => {
                        const knownWordsRecords = knownWordsIndex[row.d.word]
                        const isKnown = knownWordsRecords && knownWordsRecords[knownWordsRecords.length - 1]?.is_known;
                        return row.d.count.value > 0 && !isKnown
                    },
                )
                const scheduleRowsToReview = sortedScheduleRows.filter((r) => {
                    return r.isToReview({ now })
                })
                const scheduleRowsLearnedOrReviewedToday = sortedScheduleRows.filter((r) => {
                    return r.wasLearnedOrReviewedToday()
                })
                const learningScheduleRows = sortedScheduleRows.filter((r) =>
                    r.isLearningToday(),
                )
                const unStartedScheduleRows = sortedScheduleRows.filter(
                    (scheduleRow) => scheduleRow.unStartedToday(),
                )
                const scheduleRowsLearnedToday = sortedScheduleRows.filter(r => r.wasLearnedToday())
                const unStartedSiblingLearningRecords = uniq(getSiblingRecords(learningScheduleRows, unStartedScheduleRows))
                const unStartedSiblingsWhichShouldBe = uniq([
                    ...unStartedSiblingLearningRecords,
                    ...getSiblingRecords(scheduleRowsLearnedOrReviewedToday, unStartedScheduleRows),
                ])

                const unStartedWords = Object.values(groupBy(unStartedScheduleRows.filter(r => !unStartedSiblingsWhichShouldBe.includes(r)), r => r.d.word))
                const learningWords = Object.keys(groupBy([...learningScheduleRows, ...unStartedSiblingLearningRecords], r => r.d.word))
                const wordsLearnedForTheFirstTime = Object.keys(groupBy(scheduleRowsLearnedToday, r => r.d.word))
                const wordsRemaining = newQuizWordLimit - new Set([
                    ...learningWords,
                    ...wordsLearnedForTheFirstTime,
                ]).size
                const scheduleRowsLeftForToday = flatten(unStartedWords.slice(
                    0,
                    wordsRemaining >= 0 ? wordsRemaining : 0,
                ))
                const overDueRows = [...learningScheduleRows, ...scheduleRowsToReview, ...unStartedSiblingsWhichShouldBe].filter((r) => r.isOverDue({ now }))
                const notOverDueRows = [...learningScheduleRows, ...scheduleRowsToReview, ...unStartedSiblingsWhichShouldBe].filter((r) => !r.isOverDue({ now }))

                const iteratees = [
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.spacedDueDate.transformed,
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.finalSortValue,
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.word,
                ]
                const orders: ('asc' | 'desc')[] = ['asc', 'desc', 'asc']
                const orderFunc = (rows: SpacedScheduleRow[]) => orderBy(rows, iteratees, orders)
                /**
                 * Oh, I know why I'm getting duplicate records in limitedScheduleRows, because 问题 becomes a member of
                 * more than 1 of the 3 sets which form it.
                 */
                return {
                    scheduleRowsLeftForToday,
                    wordsToReview: orderFunc(scheduleRowsToReview),
                    /**
                     * Is there a reason I didn't sort all these at once?
                     */
                    limitedScheduleRows: orderFunc([
                        ...overDueRows,
                        ...scheduleRowsLeftForToday,
                        ...notOverDueRows,
                    ]),
                    wordsLearnedToday: orderFunc(scheduleRowsLearnedToday),
                    wordsReviewedToday: orderFunc(sortedScheduleRows.filter(r => r.wasReviewedToday())),
                    wordsLeftForToday: orderFunc(scheduleRowsLeftForToday),
                    wordsLearning: orderFunc([...learningScheduleRows, ...unStartedSiblingsWhichShouldBe]),
                    unStartedWords: orderFunc(unStartedScheduleRows),
                    debug: {
                        limitedScheduleRows: {
                            overDueRows,
                            scheduleRowsLeftForToday,
                            notOverDueRows,
                        },
                    },
                }
            }),
            distinctUntilChanged((x, y) => x.limitedScheduleRows.map(scheduleRowKey).join('') === y.limitedScheduleRows.map(scheduleRowKey).join('')),
            tapCacheScheduleRowImages(async sortedLimitedScheduleRowResult => {
                const cardIndex = await observableLastValue(cardsRepository.cardIndex$);
                return sortedLimitedScheduleRowResult.limitedScheduleRows.map(r => cardIndex[r.d.word]?.[0]?.photos?.[0])
            }),
            shareReplay(1),
        )
    }
}
