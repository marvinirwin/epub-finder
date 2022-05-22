import {observableLastValue, SettingsService} from '../../services/settings.service'
import {combineLatest, Observable} from 'rxjs'
import {debounceTime, distinctUntilChanged, map, shareReplay} from 'rxjs/operators'
import {ScheduleRow, SpacedSortQuizData} from '../schedule/schedule-row'
import {QuizCardScheduleRowsService} from '../schedule/quiz-card-schedule-rows.service'
import {TimeService} from '../time/time.service'
import {flatten, groupBy, orderBy, uniq} from 'lodash'
import {pipeLog} from './pipe.log'
import {KnownWordsRepository} from '../schedule/known-words.repository'
import {tapCacheScheduleRowImages} from './image-cache'
import CardsRepository from './cards.repository'
import {quizCardKey, scheduleRowKey} from "../util/Util";
import {getSiblingRecords} from "./group-schedule-rows";
import {LimitedScheduleRows} from "./limit-schedule-rows.type";
import {SpacedScheduleRow} from "./space-schedule-row.type";


export class SortedLimitScheduleRowsService {
    sortedLimitedScheduleRows$: Observable<LimitedScheduleRows>
    indexedSortedLimitedScheduleRows$: Observable<Map<string, number>>;

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
            settingsService.maxReviewsPerDay$.pipe(pipeLog('sorted-limited:maxReviewsPerDay')),
            settingsService.onlyReviewPresentText$.pipe(pipeLog('sorted-limited:onlyReviewPresentText')),
            timeService.quizNow$.pipe(pipeLog('sorted-limited:quizNow')),
            knownWordsRepository.indexOfOrderedRecords$.pipe(pipeLog('sorted-limited:knownWords')),
        ]).pipe(
            debounceTime(0),
            map(([sortedScheduleRows, newQuizWordLimit, maxReviewsPerDay, onlyReviewPresentText, now, knownWordsIndex]) => {
                sortedScheduleRows = sortedScheduleRows.filter(
                    (row) => {
                        const knownWordsRecords = knownWordsIndex[row.d.word]
                        const isKnown = knownWordsRecords && knownWordsRecords[knownWordsRecords.length - 1]?.is_known;
                        const isWordContainedInCurrentReadingTexts = row.d.count.value > 0;
                        const isToReview = row.isToReview({now})
                        if (onlyReviewPresentText) {
                            return isWordContainedInCurrentReadingTexts && !isKnown;
                        } else {
                            return (isWordContainedInCurrentReadingTexts || isToReview) && !isKnown;
                        }
                    },
                )
                const scheduleRowsReviewedToday = sortedScheduleRows.filter(r => r.wasReviewedToday());

                const scheduleRowsToReview = sortedScheduleRows.filter((r) => {
                    return r.isToReview({now})
                }).slice(0, Math.max(maxReviewsPerDay - scheduleRowsReviewedToday.length, 0));

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
                const overDueRows = [...learningScheduleRows, ...scheduleRowsToReview, ...unStartedSiblingsWhichShouldBe].filter((r) => r.isOverDue({now}))
                const notOverDueRows = [...learningScheduleRows, ...scheduleRowsToReview, ...unStartedSiblingsWhichShouldBe].filter((r) => !r.isOverDue({now}))

                const iteratees = [
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.finalSortValue,
                    (r: ScheduleRow<SpacedSortQuizData>) => r.d.word,
                ]
                const orders: ('asc' | 'desc')[] = ['desc', 'asc']
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
        );
        this.indexedSortedLimitedScheduleRows$ = this.sortedLimitedScheduleRows$
            .pipe(
                map(scheduleRows => {
                    const scheduleRowEntries: [string, number][] = scheduleRows
                        .limitedScheduleRows
                        .map((row, index) => {
                            const key = quizCardKey({word: row.d.word, flashCardType: row.d.flash_card_type});
                            return [key, index]
                        })
                    return new Map<string, number>(scheduleRowEntries);
                }),
                shareReplay(1)
            )
    }
}
