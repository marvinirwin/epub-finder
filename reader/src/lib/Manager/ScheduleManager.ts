import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import {MyAppDatabase} from "../Storage/AppDB";
import {Dictionary, orderBy, groupBy} from "lodash";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {WordCountTableRow} from "../ReactiveClasses/WordCountTableRow";
import {distinctUntilChanged, map, scan, switchMap, withLatestFrom} from "rxjs/operators";
import {ICountRowEmitted} from "../Interfaces/ICountRowEmitted";
import {SRM} from "../Scheduling/SRM";

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;

export const WordRecognitionLevels = {
    "Hard": -3,
    "Medium": -1,
    "Easy": 1
}

// TODO Make thes dynamic so pag

export class ScheduleManager {
    wordsSorted$!: Observable<WordCountTableRow[]>;
    addWordCountRows$: Subject<IWordCountRow[]> = new ReplaySubject<IWordCountRow[]>();
    addPersistedWordRecognitionRows$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>();
    addUnpersistedWordRecognitionRows$: Subject<IWordRecognitionRow[]> = new Subject<IWordRecognitionRow[]>();
    wordCountDict$: Subject<Dictionary<number>> = new Subject<Dictionary<number>>();
    nextWordToQuiz$: Observable<string>;

    wordScheduleRowDict$: Observable<Dictionary<WordCountTableRow>>;
    private today: number;
    private yesterday: number;
    ms: SRM;

    constructor(public db: MyAppDatabase) {
        this.today = Math.round(new Date().getTime() / DAY_IN_MINISECONDS);
        this.yesterday = this.today - 1;
        this.ms = new SRM([1, 2, 3, 8, 17], Object.values(WordRecognitionLevels));

        this.addUnpersistedWordRecognitionRows$.subscribe((async rows => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                row.id = await this.db.recognitionRecords.add(row);
            }
            this.addPersistedWordRecognitionRows$.next(rows);
        }));

        this.wordScheduleRowDict$ = this.addWordCountRows$.pipe(scan((wordRowDict: Dictionary<WordCountTableRow>, newRows) => {
            const newWordCountRowsGrouped: Dictionary<IWordCountRow[]> = groupBy(newRows, v => v.word);
            Object.entries(newWordCountRowsGrouped).forEach(([word, wordCountRecords]) => {
                const currentEntry = wordRowDict[word];
                if (!currentEntry) {
                    const newRow = new WordCountTableRow(word);
                    newRow.addCountRecords$.next(wordCountRecords)
                    wordRowDict[word] = newRow;
                } else {
                    currentEntry.addCountRecords$.next(wordCountRecords);
                }
            })
            return wordRowDict;
        }, {}));

        this.wordsSorted$ = this.wordScheduleRowDict$.pipe(
            map(dict => Object.values(dict)),
            switchMap(rows =>
                combineLatest(rows.map(r => r.currentCount$.pipe(map(count => ({count, row: r})))))
            ),
            map((recs: ICountRowEmitted[]) => orderBy(recs, ['count', 'dueDate'], ['desc', 'desc']).map(r => r.row))
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

        this.addPersistedWordRecognitionRows$
            .pipe(withLatestFrom(this.wordScheduleRowDict$))
            .subscribe(([newRecognitionRows, rowDict]) => {
                newRecognitionRows.forEach(recognitionRow => recognitionRow.nextDueDate = recognitionRow.nextDueDate || new Date());
                const group = groupBy(newRecognitionRows, v => v.word);
                Object.entries(group).forEach(([word, recognitionRows]: [string, IWordRecognitionRow[]]) => {
                    let rowDictElement = rowDict[word];
                    if (!rowDictElement) {
                        // TODO handle the case when recognition records are loaded for words which aren't in the dict
                        return;
                    }
                    rowDictElement.addNewRecognitionRecords$.next(recognitionRows)
                })
            })

        this.nextWordToQuiz$ = this.wordsSorted$.pipe(
            map(wordsSorted => wordsSorted[0]?.word),
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