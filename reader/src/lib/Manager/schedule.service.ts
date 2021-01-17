import {combineLatest, Observable} from "rxjs";
import {DatabaseService} from "../Storage/database.service";
import {orderBy} from "lodash";
import {map, shareReplay, startWith} from "rxjs/operators";
import moment from "moment";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {ScheduleRow} from "../schedule/schedule-row.interface";
import {SrmService} from "../srm/srm.service";
import {dueDate, isLearning, isNew, isToReview, wordCount} from "../schedule/ScheduleRow";
import {ScheduleRowsService} from "./schedule-rows.service";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

const LEARNING_CARDS_LIMIT = 20;

export class ScheduleService {
    wordQuizList$: Observable<ScheduleRow[]>;
    sortedScheduleRows$: Observable<ScheduleRow[]>;
    learningCards$: Observable<ScheduleRow[]>;

    private today: number;
    private yesterday: number;
    srmService: SrmService;
    newCards$: Observable<ScheduleRow[]>;
    toReviewCards$: Observable<ScheduleRow[]>;
    private db: DatabaseService;

    constructor({
                    db,
                    sortMode$: sortStrategy$,
                    scheduleRowsService
                }: {
        db: DatabaseService,
        sortMode$: Observable<string>,
        scheduleRowsService: ScheduleRowsService
    }) {
        this.db = db;
        this.today = Math.round(new Date().getTime() / DAY_IN_MINISECONDS);
        this.yesterday = this.today - 1;
        this.srmService = new SrmService();

        this.sortedScheduleRows$ = combineLatest([
            scheduleRowsService.indexedScheduleRows$,
            sortStrategy$
        ]).pipe(
            map(([indexedScheduleRows]) => {
                    let maxDueDate = Number.MIN_SAFE_INTEGER;
                    let minDueDate = Number.MAX_SAFE_INTEGER;
                    for (const word in indexedScheduleRows) {
                        const dd = dueDate(indexedScheduleRows[word]).getTime();
                        if (maxDueDate < dd) {
                            maxDueDate = dd;
                        }
                        if (minDueDate > dd) {
                            minDueDate = dd;
                        }
                    }
                    const dueDateSpread = maxDueDate - minDueDate;
                    return orderBy(Object.values(indexedScheduleRows), [(row) => {
                        const date = dueDate(row);
                        const count = wordCount(row);
                        const sortNumber = count * (date.getTime() - minDueDate) / Math.min(dueDateSpread, 2);
                        row.sortString = `${count} ${moment(date).format('MMM DD')} ${sortNumber.toString().slice(0, 3)}`;
                        row.sortNumber = sortNumber;
                        return sortNumber;
                    }], ['desc']);
                }
            ),
            shareReplay(1)
        )

        this.learningCards$ = this.sortedScheduleRows$.pipe(
            map(rows => rows.filter(row => isLearning(row))),
            shareReplay(1)
        )
        this.newCards$ = this.sortedScheduleRows$.pipe(
            map(rows => {
                return rows.filter(row => {
                    return isNew(row);
                });
            }),
            shareReplay(1)
        )
        this.toReviewCards$ = this.sortedScheduleRows$.pipe(
            map(rows => {
                return rows.filter(row => isToReview(row));
            }),
            shareReplay(1)
        )

        // First take from the learning
        // Second take from the overdue
        // Third take from the new

        this.wordQuizList$ = combineLatest([
            this.learningCards$,
            this.toReviewCards$,
            this.newCards$
        ]).pipe(
            map(([learningCards, toReviewCards, newCards]) => {
                    const learningCardsRequired = LEARNING_CARDS_LIMIT - (learningCards.length + toReviewCards.length);
                    if (learningCardsRequired > 0) {
                        const collection1 = [
                            ...learningCards,
                            ...toReviewCards,
                            ...(newCards.slice(0, learningCardsRequired) || [])
                        ];
                        return orderBy(uniqueBy(collection1, w => w.word), r => {
                            return r.sortNumber;
                        }, 'desc');
                    }
                    const collection = [...learningCards, ...toReviewCards, ...newCards];
                    return orderBy(uniqueBy(collection, w => w.word), r => {
                        return r.sortNumber;
                    }, 'desc');
                }
            ),
            shareReplay(1)
        );

    }

}