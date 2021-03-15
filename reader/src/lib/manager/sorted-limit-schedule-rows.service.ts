import {SettingsService} from "../../services/settings.service";
import {ScheduleService} from "../schedule/schedule.service";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {orderBy} from "lodash";
import {NormalizedQuizCardScheduleRowData, QuizScheduleRowData, ScheduleRow} from "../schedule/schedule-row";
import {QuizCardScheduleRowsService} from "../schedule/quiz-card-schedule-rows.service";

type LimitedScheduleRows = {
    wordsToReview: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    limitedScheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    wordsLearnedToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    wordsReviewingOrLearning: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    wordsLeftForToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[]
};

export class SortedLimitScheduleRowsService {
    sortedLimitedScheduleRows$: Observable<LimitedScheduleRows>;
    constructor(
        {
            settingsService,
            scheduleService,
        }: {

            settingsService: SettingsService,
            scheduleService: QuizCardScheduleRowsService,
        }
    ) {
        this.sortedLimitedScheduleRows$ = combineLatest([
            scheduleService.indexedScheduleRows$.pipe(map(index => Object.values(index))),
            settingsService.newQuizWordLimit$,
        ]).pipe(
            map(([sortedScheduleRows, newQuizWordLimit]) => {
                const wordsToReview = sortedScheduleRows.filter(
                    r => r.isToReview()
                );
                const wordsLearnedToday = sortedScheduleRows.filter(
                    r => r.wasLearnedToday()
                );
                const learning = sortedScheduleRows.filter(
                    r => r.isLearning()
                )
                const unstartedWords = sortedScheduleRows.filter(
                    scheduleRow => !scheduleRow.isUnlearned()
                ).slice(0, newQuizWordLimit - wordsLearnedToday.length);

                let collection = [
                    ...wordsToReview,
                    ...learning,
                    ...unstartedWords
                ];
                const ren = collection.find(word => word.d.word === '人');
                debugger;console.log();
                return {
                    wordsToReview,
                    wordsLearnedToday,
                    wordsReviewingOrLearning: learning,
                    wordsLeftForToday: unstartedWords,
                    limitedScheduleRows: orderBy(
                        collection,
                        r => r.d.finalSortValue,
                        'desc'
                    )
                }
            }),
            shareReplay(1)
        )
    }
}