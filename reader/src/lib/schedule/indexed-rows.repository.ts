import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs";
import { ds_Dict } from "../delta-scan/delta-scan.module";
import {
  filter,
  map,
  shareReplay,
  startWith,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { orderBy, flatten } from "lodash";
import { DatabaseService } from "../Storage/database.service";
import { safePush } from "@shared/";

export class IndexedRowsRepository<T extends { id?: number }> {
  indexOfOrderedRecords$: ReplaySubject<ds_Dict<T[]>> = new ReplaySubject<
    ds_Dict<T[]>
  >(1);
  recordList$: Observable<T[]>;
  latestRecords$ = new BehaviorSubject<Map<string, T>>(new Map());
  addRecords$: ReplaySubject<T[]> = new ReplaySubject<T[]>(1);
  clearRecords$ = new ReplaySubject<void>(1);

  constructor({
    db,
    load,
    add,
    getIndexValue,
  }: {
    db: DatabaseService;
    load: () => AsyncGenerator<T[]>;
    add: (t: T) => Promise<number>;
    getIndexValue: (v: T) => { indexValue: string };
  }) {
    this.indexOfOrderedRecords$.next({});
    this.addRecords$
      .pipe(
        filter((rows) => !!rows.length),
        withLatestFrom(this.indexOfOrderedRecords$.pipe(startWith({}))),
        tap(([rows, wordRecognitionRecords]: [T[], ds_Dict<T[]>]) => {
          const newLatestRecords = new Map<string, T>(
            this.latestRecords$.getValue()
          );
          rows.forEach((row) => {
            const { indexValue } = getIndexValue(row);
            safePush(wordRecognitionRecords, indexValue, row);
            wordRecognitionRecords[indexValue] = orderBy(
              wordRecognitionRecords[indexValue],
              "timestamp"
            );
            newLatestRecords.set(indexValue, row);
          });
          // This is a hack side effect
          this.indexOfOrderedRecords$.next(wordRecognitionRecords);
          this.latestRecords$.next(newLatestRecords);
        })
      )
      .subscribe(([rows]) => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row.id) {
            add(row).then((id) => (row.id = id));
          }
        }
      });
    this.clearRecords$.subscribe((v) => this.indexOfOrderedRecords$.next({}));
    this.recordList$ = this.indexOfOrderedRecords$.pipe(
      map((recordObject) => flatten(Object.values(recordObject))),
      shareReplay(1)
    );
    this.loadGenerator(load);
  }

  private async loadGenerator(load: () => AsyncGenerator<T[]>) {
    const generator = load();
    for await (const rowChunk of generator) {
      this.addRecords$.next(rowChunk);
    }
  }
}
