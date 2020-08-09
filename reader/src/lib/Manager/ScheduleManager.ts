import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";
import {MyAppDatabase} from "../Storage/AppDB";
import {Dictionary, groupBy, orderBy} from "lodash";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {ScheduleRow} from "../ReactiveClasses/ScheduleRow";
import {map, scan, withLatestFrom} from "rxjs/operators";
import {SRM} from "../Scheduling/SRM";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

const LEARNING_CARDS_LIMIT = 20;

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

export class ScheduleManager {
    wordQuizList$: Observable<string[]>;

    private static resolveWordRow(wordRowDict: Dictionary<ScheduleRow>, word: string) {
        if (!wordRowDict[word]) wordRowDict[word] = new ScheduleRow(word);
        return wordRowDict[word];
    }

    sortedScheduleRows$: Observable<ScheduleRow[]>;
    learningCards$: Observable<ScheduleRow[]>;
    addWordCountRows$: Subject<IWordCountRow[]> = new ReplaySubject<IWordCountRow[]>(1);
    addPersistedWordRecognitionRows$: ReplaySubject<WordRecognitionRow[]> = new ReplaySubject<WordRecognitionRow[]>(1);
    addUnpersistedWordRecognitionRows$: Subject<WordRecognitionRow[]> = new Subject<WordRecognitionRow[]>();
    wordCountDict$: Subject<Dictionary<number>> = new Subject<Dictionary<number>>();
    wordScheduleRowDict$ = new ReplaySubject<Dictionary<ScheduleRow>>(1);

    private today: number;
    private yesterday: number;
    ms: SRM;
    newCards$: Observable<ScheduleRow[]>;
    toReviewCards$: Observable<ScheduleRow[]>;

    constructor(public db: MyAppDatabase) {
        this.wordScheduleRowDict$.next({});
        this.today = Math.round(new Date().getTime() / DAY_IN_MINISECONDS);
        this.yesterday = this.today - 1;
        this.ms = new SRM();

        this.addUnpersistedWordRecognitionRows$.subscribe((rows => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                this.db.recognitionRecords.add(row).then(id => row.id = id);
            }
            this.addPersistedWordRecognitionRows$.next(rows);
        }));

        this.addWordCountRows$.pipe(
            withLatestFrom(this.wordScheduleRowDict$),
        ).subscribe(([newRows, wordRowDict]) => {
            Object.entries(groupBy(newRows, v => v.word))
                .forEach(([word, wordCountRecords]) => {
                    ScheduleManager.resolveWordRow(wordRowDict, word).wordCountRecords.push(...wordCountRecords);
                })
            this.wordScheduleRowDict$.next(wordRowDict);
        });
        this.addPersistedWordRecognitionRows$.pipe(
            withLatestFrom(this.wordScheduleRowDict$)
        ).subscribe(([newWordRecognitionRows, wordRowDict]) => {
            Object.entries(groupBy(newWordRecognitionRows, v => v.word))
                .forEach(([word, wordRecognitionRecords]) => {
                    ScheduleManager.resolveWordRow(wordRowDict, word).addWordRecognitionRecords(...wordRecognitionRecords);
                })
            this.wordScheduleRowDict$.next(wordRowDict);
        })

        this.sortedScheduleRows$ = this.wordScheduleRowDict$.pipe(
            map(dict => {
                    return orderBy(Object.values(dict), ['orderValue'], ['desc']);
                }
            )
        )

        this.wordCountDict$.pipe(scan((oldCounts: Dictionary<number>, newCounts) => {
            const diffs: IWordCountRow[] = [];
            const keys = Array.from(new Set([
                ...Object.keys(oldCounts),
                ...Object.keys(newCounts)
            ]));
            for (let key of keys) {
                const oldCount = oldCounts[key] || 0;
                const newCount = newCounts[key] || 0;
                if (oldCount !== newCount) {
                    diffs.push({word: key, count: newCount - oldCount, book: ''})
                }
            }
            if (diffs) {
                this.addWordCountRows$.next(diffs)
            }
            return newCounts;
        }, {})).subscribe(() => console.log())


        this.learningCards$ = this.sortedScheduleRows$.pipe(
            map(rows => rows.filter(row => row.learning()))
        )
        this.newCards$ = this.sortedScheduleRows$.pipe(
            map(rows => {
                return rows.filter(row => {
                    return row.new();
                });
            })
        )
        this.toReviewCards$ = this.sortedScheduleRows$.pipe(
            map(rows => rows.filter(row => row.toReview()))
        )

        // First take from the learning
        // Second take from the overdue
        // Third take from the new

        this.wordQuizList$ = combineLatest([
            this.learningCards$,
            this.toReviewCards$,
            this.newCards$
        ]).pipe(map(([c1, c2, c3]): string[] => {

            const learningCardsRequired = LEARNING_CARDS_LIMIT - (c1.length + c2.length);
            if (learningCardsRequired > 0) {
                let scheduleRows = c3.slice(learningCardsRequired);
                return shuffle([
                    ...c1, ...c2, ...scheduleRows
                ]).map(r => r.word);
            }
            return [...c1, ...c2, ...c3].map(r => r.word);
        }));

        this.loadRecognitionRows();
    }

    private async loadRecognitionRows() {
        const generator = this.db.getRecognitionRowsFromDB();
        for await (let rowChunk of generator) {
            this.addPersistedWordRecognitionRows$.next(rowChunk);
        }
    }
}