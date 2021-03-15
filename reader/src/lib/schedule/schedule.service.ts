import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {SrmService} from "../srm/srm.service";
import {ScheduleRow,} from "./schedule-row";
import {ScheduleRowsService} from "./schedule-rows-service.interface";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;


export class ScheduleService<T> {
    sortedScheduleRows$: Observable<ScheduleRow<T>[]>;
    learningCards$: Observable<ScheduleRow<T>[]>;

    private today: number;
    private yesterday: number;
    srmService: SrmService;
    newCards$: Observable<ScheduleRow<T>[]>;
    toReviewCards$: Observable<ScheduleRow<T>[]>;
    cardsLearnedToday$: Observable<ScheduleRow<T>[]>;

    constructor({
                    scheduleRowsService,
                }: {
        scheduleRowsService: ScheduleRowsService<T>,
    }) {
        this.today = Math.round(new Date().getTime() / DAY_IN_MINISECONDS);
        this.yesterday = this.today - 1;
        this.srmService = new SrmService();

        this.sortedScheduleRows$ = scheduleRowsService.indexedScheduleRows$.pipe(
            // Relying on javascript object value ordering behaviour here, bad idea
            map((rowDict) => Object.values(rowDict) ),
            shareReplay(1)
        )

        this.learningCards$ = this.sortedScheduleRows$.pipe(
            map(rows => rows.filter(row => row.isLearning())),
            shareReplay(1)
        )
        this.newCards$ = this.sortedScheduleRows$.pipe(
            map(rows => {
                return rows.filter(row => {
                    return row.isNew();
                });
            }),
            shareReplay(1)
        )
        this.toReviewCards$ = this.sortedScheduleRows$.pipe(
            map(rows => {
                return rows.filter(row => row.isToReview());
            }),
            shareReplay(1)
        )

        // First take from the learning
        // Second take from the overdue
        // Third take from the new

        this.cardsLearnedToday$ = this.sortedScheduleRows$.pipe(
            map(
                rows => rows.filter(row => row.wasLearnedToday())
            )
        )

    }

}