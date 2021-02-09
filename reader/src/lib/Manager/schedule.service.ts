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
import {SettingsService} from "../../services/settings.service";
import {ScheduleMathService} from "./schedule-math.service";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";

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
                    scheduleRowsService,
                    settingsService
                }: {
        db: DatabaseService,
        scheduleRowsService: ScheduleRowsService,
        settingsService: SettingsService
    }) {
        this.db = db;
        this.today = Math.round(new Date().getTime() / DAY_IN_MINISECONDS);
        this.yesterday = this.today - 1;
        this.srmService = new SrmService();

        this.sortedScheduleRows$ = combineLatest([
            scheduleRowsService.indexedScheduleRows$,
            settingsService.frequencyWeight$
        ]).pipe(
            map(([indexedScheduleRows, frequencyWeight]) => {
                    return ScheduleMathService.sortScheduleRows(
                        Object.values(indexedScheduleRows).filter(row => row.word.split('')
                            .find(isChineseCharacter)),
                        frequencyWeight,
                        1 - frequencyWeight
                    )
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