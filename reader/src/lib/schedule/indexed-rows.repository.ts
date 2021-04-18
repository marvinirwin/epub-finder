import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs'
import { ds_Dict } from '../delta-scan/delta-scan.module'
import {
    filter,
    map,
    shareReplay,
    startWith,
    tap,
    withLatestFrom,
} from 'rxjs/operators'
import { orderBy, flatten } from 'lodash'
import { DatabaseService } from '../Storage/database.service'
import { safePush } from '@shared/'
import { SuperMemoGrade } from 'supermemo'

export class IndexedRowsRepository<T extends { id?: number  }> {
    indexOfOrderedRecords$: ReplaySubject<ds_Dict<T[]>> = new ReplaySubject<
        ds_Dict<T[]>
    >(1)
    recordList$: Observable<T[]>
    latestRecords$ = new BehaviorSubject<Map<string, T>>(new Map())
    addRecords$: ReplaySubject<T[]> = new ReplaySubject<T[]>(1)
    clearRecords$ = new ReplaySubject<void>(1)

    constructor({
        databaseService,
        load,
        add,
        getIndexValue,
    }: {
        databaseService: DatabaseService
        load: () => AsyncGenerator<T[]>
        add: (t: T) => Promise<number>
        getIndexValue: (v: T) => { indexValue: string }
    }) {
        this.indexOfOrderedRecords$.next({})
        this.addRecords$
            .pipe(
                filter((rows) => !!rows.length),
                withLatestFrom(this.indexOfOrderedRecords$.pipe(startWith({}))),
                tap(([rows, recordIndex]: [T[], ds_Dict<T[]>]) => {
                    const newLatestRecords = new Map<string, T>(
                        this.latestRecords$.getValue(),
                    )
                    const indexValuesPushed = new Set<string>();
                    rows.forEach((row) => {
                        const { indexValue } = getIndexValue(row)
                        // @ts-ignore
                        if (typeof row.timestamp === 'string') row.timestamp = new Date(row.timestamp)
                        // @ts-ignore
                        if (typeof row.nextDueDate === 'string') row.nextDueDate = new Date(row.nextDueDate)
                        safePush(recordIndex, indexValue, row)
                        indexValuesPushed.add(indexValue);
                        newLatestRecords.set(indexValue, row)
                    })
                    indexValuesPushed.forEach((indexValue => {
                        recordIndex[indexValue] = orderBy(
                            recordIndex[indexValue],
                            'timestamp',
                        )
                    }))
                    // This is a hack side effect
                    this.indexOfOrderedRecords$.next(recordIndex)
                    this.latestRecords$.next(newLatestRecords)
                }),
            ).subscribe(([rows]) => {
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i]
                    if (!row.id) {
                        add(row).then((id) => (row.id = id))
                    }
                }
            })
        this.clearRecords$.subscribe((v) =>
            this.indexOfOrderedRecords$.next({}),
        )
        this.recordList$ = this.indexOfOrderedRecords$.pipe(
            map((recordObject) => flatten(Object.values(recordObject))),
            shareReplay(1),
        )
        this.loadGenerator(load)
    }

    private async loadGenerator(load: () => AsyncGenerator<T[]>) {
        const generator = load()
        for await (const rowChunk of generator) {
            this.addRecords$.next(rowChunk)
        }
    }
}
