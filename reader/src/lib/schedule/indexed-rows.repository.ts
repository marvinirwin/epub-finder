import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs'
import { ds_Dict } from '../delta-scan/delta-scan.module'
import {
    filter,
    map,
    shareReplay,
    startWith, switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators'
import { orderBy, flatten } from 'lodash'
import { DatabaseService } from '../Storage/database.service'
import { safePush, UnPersistedEntity } from '@shared/'
import { SuperMemoGrade } from 'supermemo'


export type PotentialExcludedDbColumns<T> = Omit<T, 'creator_id' | 'id'> | T;

export class IndexedRowsRepository<T extends { id: number | string, created_at: Date, creator_id: number | string }> {
    indexOfOrderedRecords$: ReplaySubject<ds_Dict<PotentialExcludedDbColumns<T>[]>> = new ReplaySubject(1)
    recordList$: Observable<PotentialExcludedDbColumns<T>[]>
    latestRecords$ = new BehaviorSubject<Map<string, PotentialExcludedDbColumns<T>>>(new Map())
    addRecords$: ReplaySubject<PotentialExcludedDbColumns<T>[]> = new ReplaySubject<PotentialExcludedDbColumns<T>[]>(1)
    clearRecords$ = new ReplaySubject<void>(1)

    constructor({
        load,
        add,
        getIndexValue,
    }: {
        databaseService: DatabaseService
        load: () => Promise<AsyncGenerator<UnPersistedEntity<T>[]>> | AsyncGenerator<UnPersistedEntity<T>[]>
        add: (t: PotentialExcludedDbColumns<T>) => Promise<T>
        getIndexValue: (v: PotentialExcludedDbColumns<T>) => { indexValue: string }
    }) {
        this.indexOfOrderedRecords$.next({})
        this.addRecords$
            .pipe(
                filter((rows) => !!rows.length),
                switchMap(async rows => Promise.all(
                    rows.map(async row => {
                        if (!(row as T).id) {
                            add(row).then(returnedRow => (row as T).id = returnedRow.id);
                        }
                        return row;
                    })
                )),
                withLatestFrom(this.indexOfOrderedRecords$.pipe(startWith({}))),
                tap(([rows, recordIndex]: [PotentialExcludedDbColumns<T>[], ds_Dict<PotentialExcludedDbColumns<T>[]>]) => {
                    const newLatestRecords = new Map<string, PotentialExcludedDbColumns<T>>(
                        this.latestRecords$.getValue(),
                    )
                    const indexValuesPushed = new Set<string>();
                    rows.forEach((row) => {
                        const { indexValue } = getIndexValue(row)
                        // @ts-ignore
                        if (typeof row.created_at === 'string') row.created_at = new Date(row.created_at)
                        // @ts-ignore
                        if (typeof row.nextDueDate === 'string') row.nextDueDate = new Date(row.nextDueDate)
                        safePush(recordIndex, indexValue, row)
                        indexValuesPushed.add(indexValue);
                        newLatestRecords.set(indexValue, row)
                    })
                    indexValuesPushed.forEach((indexValue => {
                        recordIndex[indexValue] = orderBy(
                            recordIndex[indexValue],
                            r => r.created_at,
                        )
                    }))
                    // This is a hack side effect
                    this.indexOfOrderedRecords$.next({...recordIndex})
                    this.latestRecords$.next(newLatestRecords)
                }),
            ).subscribe();
        this.clearRecords$.subscribe((v) =>
            this.indexOfOrderedRecords$.next({}),
        )
        this.recordList$ = this.indexOfOrderedRecords$.pipe(
            map((recordObject) => flatten(Object.values(recordObject))),
            shareReplay(1),
        );
        // @ts-ignore
        this.loadGenerator(load);
    }

    private async loadGenerator(getGenerator: () => Promise<AsyncGenerator<T[]>> | AsyncGenerator<T[]>) {
        const generator = await getGenerator()
        for await (const rowChunk of generator) {
            this.addRecords$.next(rowChunk)
        }
    }
}
