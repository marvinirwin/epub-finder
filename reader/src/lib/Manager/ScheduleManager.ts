import {Observable, ReplaySubject, Subject} from "rxjs";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import {MyAppDatabase} from "../Storage/AppDB";
import {Dictionary, groupBy, orderBy} from "lodash";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {WordCountTableRow} from "../ReactiveClasses/WordCountTableRow";
import {distinctUntilChanged, map, scan, withLatestFrom} from "rxjs/operators";
import {SRM} from "../Scheduling/SRM";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

export class ScheduleManager {
    wordsSorted$: Observable<WordCountTableRow[]>;
    addWordCountRows$: Subject<IWordCountRow[]> = new ReplaySubject<IWordCountRow[]>();
    addPersistedWordRecognitionRows$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>();
    addUnpersistedWordRecognitionRows$: Subject<IWordRecognitionRow[]> = new Subject<IWordRecognitionRow[]>();
    wordCountDict$: Subject<Dictionary<number>> = new Subject<Dictionary<number>>();
    nextWordToQuiz$: Observable<string>;
    wordScheduleRowDict$ = new ReplaySubject<Dictionary<WordCountTableRow>>();

    private today: number;
    private yesterday: number;
    ms: SRM;

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

        this.nextWordToQuiz$ = this.wordsSorted$.pipe(
            map(wordsSorted => wordsSorted[0]?.word),
            distinctUntilChanged()
        );

        this.loadRecognitionRows();
    }

    private static resolveWordRow(wordRowDict: Dictionary<WordCountTableRow>, word: string) {
        if (!wordRowDict[word]) wordRowDict[word] = new WordCountTableRow(word);
        return wordRowDict[word];
    }

    private async loadRecognitionRows() {
        const generator = this.db.getRecognitionRowsFromDB();
        for await (let rowChunk of generator) {
            this.addPersistedWordRecognitionRows$.next(rowChunk);
        }
    }
}