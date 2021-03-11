import {combineLatest, Observable} from "rxjs";
import {DatabaseService} from "../Storage/database.service";
import {orderBy} from "lodash";
import {map, shareReplay, startWith} from "rxjs/operators";
import moment from "moment";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {SrmService} from "../srm/srm.service";
import {ScheduleRowsService} from "./schedule-rows.service";
import {SettingsService} from "../../services/settings.service";
import {ScheduleMathService} from "./schedule-math.service";
import {isChineseCharacter} from "../../../../server/src/shared/OldAnkiClasses/Card";
import {NormalizedScheduleRowData, ScheduleRow, ScheduleRowData} from "../schedule/schedule-row";
import {filterQuizRows} from "../../components/quiz/quiz.service";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

const LEARNING_CARDS_LIMIT = 20;

export class ScheduleService {
    wordQuizList$: Observable<ScheduleRow[]>;
    sortedScheduleRows$: Observable<ScheduleRow<NormalizedScheduleRowData>[]>;
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

        this.sortedScheduleRows$ = scheduleRowsService.indexedScheduleRows$.pipe(
            // Relying on javascript object value ordering behaviour here, bad idea
            map((rowDict) => Object.values(rowDict) ),
            shareReplay(1)
        )

        this.learningCards$ = this.sortedScheduleRows$.pipe(
            map(rows => rows.filter(row => row.isLearningOrReviewing())),
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
                        return uniqueBy(collection1, w => w.d.word);
                    }
                    const collection = [...learningCards, ...toReviewCards, ...newCards];
                    return uniqueBy(collection, w => w.d.word);
                }
            ),
            shareReplay(1)
        );

    }

}