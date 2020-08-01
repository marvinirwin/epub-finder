import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import {MyAppDatabase} from "../Storage/AppDB";
import {Dictionary, groupBy, orderBy} from "lodash";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {ScheduleRow} from "../ReactiveClasses/ScheduleRow";
import {distinctUntilChanged, map, scan, withLatestFrom} from "rxjs/operators";
import {SRM} from "../Scheduling/SRM";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

export class ScheduleManager {

    private static resolveWordRow(wordRowDict: Dictionary<ScheduleRow>, word: string) {
        if (!wordRowDict[word]) wordRowDict[word] = new ScheduleRow(word);
        return wordRowDict[word];
    }

    wordsSorted$: Observable<ScheduleRow[]>;
    learningCards$: Observable<ScheduleRow[]>;
    addWordCountRows$: Subject<IWordCountRow[]> = new ReplaySubject<IWordCountRow[]>();
    addPersistedWordRecognitionRows$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>();
    addUnpersistedWordRecognitionRows$: Subject<IWordRecognitionRow[]> = new Subject<IWordRecognitionRow[]>();
    wordCountDict$: Subject<Dictionary<number>> = new Subject<Dictionary<number>>();
    nextWordToQuiz$: Observable<string | undefined>;
    wordScheduleRowDict$ = new ReplaySubject<Dictionary<ScheduleRow>>();

    newWordsPerDayLimit$ = new ReplaySubject<number>(1);
    newWordsList$: Observable<string[]>;

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

        this.addUnpersistedWordRecognitionRows$.subscribe((async rows => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                row.id = await this.db.recognitionRecords.add(row);
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
                .forEach(([word, wordCountRecords]) => {
                    ScheduleManager.resolveWordRow(wordRowDict, word).wordRecognitionRecords.push(...wordCountRecords);
                })
            this.wordScheduleRowDict$.next(wordRowDict);
        })

        this.wordsSorted$ = this.wordScheduleRowDict$.pipe(
            map(dict =>
                orderBy(Object.values(dict), ['orderValue'], ['desc'])
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


        this.newWordsList$ = this.wordsSorted$.pipe(
            map(words => words.filter(w => {
                return w.wordRecognitionRecords.length === 0 && w.word;
            }).map(w => {
                return w.word;
            })),
        )


        this.learningCards$ = this.wordsSorted$.pipe(
            map(rows => rows.filter(row => row.learning()))
        )
        this.newCards$ = this.wordsSorted$.pipe(
            map(rows => {
                return rows.filter(row => {
                    return row.new();
                });
            })
        )
        this.toReviewCards$ = this.wordsSorted$.pipe(
            map(rows => rows.filter(row => row.toReview()))
        )

        // First take from the learning
        // Second take from the overdue
        // Third take from the new
        this.nextWordToQuiz$ = combineLatest([
            this.learningCards$,
            this.toReviewCards$,
            this.newCards$
        ]).pipe(
            map((args/*[learningCards, toReviewCards, newCards]*/) => {
                let find = args.find(cardList =>
                    cardList.length
                );
                return find ? find[0].word : undefined
            }),
            distinctUntilChanged()
        );

        this.loadRecognitionRows();
    }

    private async loadRecognitionRows() {
        const generator = this.db.getRecognitionRowsFromDB();
        for await (let rowChunk of generator) {
            this.addPersistedWordRecognitionRows$.next(rowChunk);
        }
    }
}