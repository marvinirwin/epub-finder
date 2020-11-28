import {ReplaySubject, Subject} from "rxjs";
import {ds_Dict} from "../Tree/DeltaScanner";
import {filter, startWith, tap, withLatestFrom} from "rxjs/operators";
import {safePush} from "../../test/Util/GetGraphJson";
import {orderBy} from "lodash";
import {DatabaseService} from "../Storage/database.service";

export class ProgressRowService<T extends {word: string, id?: number}> {
    wordRecognitionRecords$: ReplaySubject<ds_Dict<T[]>> = new ReplaySubject<ds_Dict<T[]>>(1);
    addWordRecognitionRecords$: Subject<T[]> = new Subject<T[]>();
    constructor({
                    db,
        load, add
    }: {
        db: DatabaseService,
        load: () => AsyncGenerator<T[]>,
        add: (t: T) => Promise<number>
    }) {
        this.addWordRecognitionRecords$.pipe(
            filter(rows => !!rows.length),
            withLatestFrom(this.wordRecognitionRecords$.pipe(startWith({}))),
            tap(([rows, wordRecognitionRecords]: [T[], ds_Dict<T[]>]) => {
                rows.forEach(row => {
                    safePush(wordRecognitionRecords, row.word, row);
                    wordRecognitionRecords[row.word] = orderBy(wordRecognitionRecords[row.word], 'timestamp');
                });
                this.wordRecognitionRecords$.next(wordRecognitionRecords);
            }),
        ).subscribe((([rows]) => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (!row.id) {
                    add(row).then(id => row.id = id)
                }
            }
        }));
        this.loadGenerator(load);
    }

    private async loadGenerator(load: () => AsyncGenerator<T[]>) {
        const generator = load();
        for await (const rowChunk of generator) {
            this.addWordRecognitionRecords$.next(rowChunk);
        }
    }
}
