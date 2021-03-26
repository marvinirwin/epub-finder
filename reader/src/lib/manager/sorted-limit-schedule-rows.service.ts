import {SettingsService} from "../../services/settings.service";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {orderBy} from "lodash";
import {NormalizedQuizCardScheduleRowData, ScheduleRow} from "../schedule/schedule-row";
import {QuizCardScheduleRowsService} from "../schedule/quiz-card-schedule-rows.service";

type LimitedScheduleRows = {
    wordsToReview: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    limitedScheduleRows: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    wordsLearnedToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    wordsReviewingOrLearning: ScheduleRow<NormalizedQuizCardScheduleRowData>[];
    wordsLeftForToday: ScheduleRow<NormalizedQuizCardScheduleRowData>[],
    unStartedWords: ScheduleRow<NormalizedQuizCardScheduleRowData>[],
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
                sortedScheduleRows = sortedScheduleRows.filter(row => row.d.count.value > 0);
                const wordsToReview = sortedScheduleRows.filter(
                    r => r.isToReview()
                );
                const wordsLearnedToday = sortedScheduleRows.filter(
                    r => {
                        return r.wasLearnedToday();
                    }
                );
                const learning = sortedScheduleRows.filter(
                    r => r.isLearning()
                )
                const unStartedWords = sortedScheduleRows.filter(
                    scheduleRow => scheduleRow.isNotStarted()
                );
                const wordsLeftForToday = unStartedWords.slice(0, newQuizWordLimit - wordsLearnedToday.length);

                /**
                 * The first rows are those which are overdue
                 */
                const overDue = orderBy([...learning, ...wordsToReview].filter(r => r.isOverDue()), r => r.isOverDue(), 'asc');
                const notOverDue = orderBy([...learning, ...wordsToReview].filter(r => !r.isOverDue()), r => r.dueDate(), 'asc');
                /**
                 * The second are those which are overDue and reviewing
                 */
                return {
                    wordsToReview,
                    wordsLearnedToday,
                    wordsLeftForToday,
                    wordsReviewingOrLearning: learning,
                    unStartedWords,
                    limitedScheduleRows: [
                        ...overDue,
                        ...wordsLeftForToday,
                        ...notOverDue
                    ],
                }
            }),
            shareReplay(1)
        )
    }
}