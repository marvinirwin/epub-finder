import {combineLatest, Observable} from "rxjs";
import {DatabaseService} from "../Storage/database.service";
import {orderBy} from "lodash";
import {BookWordCount} from "../Interfaces/BookWordCount";
import {map, shareReplay, startWith} from "rxjs/operators";
import {ds_Dict} from "../Tree/DeltaScanner";
import moment from "moment";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {ProgressRowService} from "../schedule/progress-row.service";
import {ScheduleRow} from "../schedule/schedule-row.interface";
import {SrmService} from "../srm/srm.service";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {dueDate, isLearning, isNew, isToReview, wordCount} from "../schedule/ScheduleRow";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

const LEARNING_CARDS_LIMIT = 20;

/*
function shuffle<T>(array: T[]): T[] {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
*/

export class ScheduleManager {
    wordQuizList$: Observable<ScheduleRow[]>;
    sortedScheduleRows$: Observable<ScheduleRow[]>;
    indexedScheduleRows$: Observable<ds_Dict<ScheduleRow>>;
    learningCards$: Observable<ScheduleRow[]>;

    private today: number;
    private yesterday: number;
    srmService: SrmService;
    newCards$: Observable<ScheduleRow[]>;
    toReviewCards$: Observable<ScheduleRow[]>;
    private db: DatabaseService;

    constructor({
                    db,
                    wordCounts$,
                    sortMode$: sortStrategy$,
        recognitionRecordsService
                }: {
        wordCounts$: Observable<ds_Dict<BookWordCount[]>>,
        db: DatabaseService,
        sortMode$: Observable<string>,
        recognitionRecordsService: ProgressRowService<WordRecognitionRow>
    }) {
        this.db = db;
        this.today = Math.round(new Date().getTime() / DAY_IN_MINISECONDS);
        this.yesterday = this.today - 1;
        this.srmService = new SrmService();


        this.indexedScheduleRows$ = combineLatest([
            recognitionRecordsService.wordRecognitionRecords$.pipe(startWith({})),
            wordCounts$.pipe(startWith({}))
        ]).pipe(
            map(([wordRecognition, wordCounts]) => {
                const scheduleRows: ds_Dict<ScheduleRow> = {};

                function ensureScheduleRow(word: string) {
                    if (!scheduleRows[word]) {
                        scheduleRows[word] = {wordRecognitionRecords: [], wordCountRecords: [], word};
                    }
                    return scheduleRows[word];
                }

                Object.entries(wordCounts).forEach(([word, wordCountRecords]) => {
                    ensureScheduleRow(word).wordCountRecords.push(...wordCountRecords);
                });
                Object.entries(wordRecognition).forEach(([word, wordRecognitionRecords]) => {
                    scheduleRows[word]?.wordRecognitionRecords.push(...wordRecognitionRecords);
                });
                return scheduleRows;
            }),
            shareReplay(1)
        );

        this.sortedScheduleRows$ = combineLatest([
            this.indexedScheduleRows$,
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
                        const sortNumber = count * (date.getTime() - minDueDate) / dueDateSpread;
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