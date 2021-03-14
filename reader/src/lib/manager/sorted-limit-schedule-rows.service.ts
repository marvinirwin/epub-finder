import {SettingsService} from "../../services/settings.service";
import {ScheduleService} from "./schedule.service";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {orderBy} from "lodash";
import {NormalizedScheduleRowData, ScheduleRow} from "../schedule/schedule-row";

type LimitedScheduleRows = {
    wordsToReview: ScheduleRow<NormalizedScheduleRowData>[];
    limitedScheduleRows: ScheduleRow<NormalizedScheduleRowData>[];
    wordsLearnedToday: ScheduleRow<NormalizedScheduleRowData>[];
    wordsReviewingOrLearning: ScheduleRow<NormalizedScheduleRowData>[];
    wordsLeftForToday: ScheduleRow<NormalizedScheduleRowData>[]
};

export class SortedLimitScheduleRowsService {
    sortedLimitedScheduleRows$: Observable<LimitedScheduleRows>;
    constructor(
        {
            settingsService,
            scheduleService,
        }: {

            settingsService: SettingsService,
            scheduleService: ScheduleService,
        }
    ) {
        this.sortedLimitedScheduleRows$ = combineLatest([
            scheduleService.sortedScheduleRows$,
            settingsService.newQuizWordLimit$,
        ]).pipe(
            map(([sortedScheduleRows, newQuizWordLimit]) => {
                const wordsToReview = sortedScheduleRows.filter(
                    r => r.d.wordCountRecords.length && r.isToReview()
                );
                const wordsLearnedToday = sortedScheduleRows.filter(
                    r => r.wasLearnedToday()
                );
                const wordsReviewingOrLearning = sortedScheduleRows.filter(
                    r => r.isLearning()
                )
                const wordsWhichHaventBeenStarted = sortedScheduleRows.filter(
                    scheduleRow => scheduleRow.d.wordCountRecords.length && !scheduleRow.isUnlearned()
                ).slice(0, newQuizWordLimit - wordsLearnedToday.length);

                return {
                    wordsToReview,
                    wordsLearnedToday,
                    wordsReviewingOrLearning,
                    wordsLeftForToday: wordsWhichHaventBeenStarted,
                    limitedScheduleRows: orderBy(
                        [
                            ...wordsToReview,
                            ...wordsReviewingOrLearning,
                            ...wordsWhichHaventBeenStarted
                        ],
                        r => r.d.finalSortValue,
                        'desc'
                    )
                }
            }),
            shareReplay(1)
        )
    }
}