import { DatabaseService, PersistableEntity} from './database.service'
import Dexie from 'dexie'
import {putPersistableEntity} from "./putPersistableEntity";

export class IndexDBManager<T> {
    constructor(
        public db: DatabaseService,
        public table: PersistableEntity,
        public getId: (v: T) => number | undefined,
        public assignId: (newId: number, o: T) => T,
    ) {}
    load(where: (t: PersistableEntity) => Promise<T[]>): Promise<T[]> {
        return where(this.table)
    }

    async upsert(
        m: T | T[],
        isMeWhere: (table: PersistableEntity) => Promise<T[]>,
    ) {
        return this.db.transaction('rw', this.table, async () => {
            try {
                const presentRecords = await isMeWhere(this.table)
                // If I am already here, delete
                const keys: number[] = []
                presentRecords
                    .map(this.getId)
                    .forEach((n) => n !== undefined && keys.push(n))
                const recordsToPut = Array.isArray(m) ? m : [m]
                const recordsWithAssignedIds = []
                for (let i = 0; i < recordsToPut.length; i++) {
                    // WHat's the difference between put and add
                    const recordToInsert = recordsToPut[i]
                    const id = this.getId(recordToInsert)
                    let newId
                    if (id) {
                        newId = await putPersistableEntity({entity: this.table, record: recordToInsert});
                    } else {
                        // @ts-ignore
                        if (recordToInsert.hasOwnProperty('id'))
                            // @ts-ignore If the id property is present, but undefined it will error when inserted
                            delete recordToInsert.id
                        newId = await putPersistableEntity({entity: this.table, record: recordToInsert});
                    }
                    recordsWithAssignedIds.push(
                        this.assignId(newId, recordToInsert),
                    )
                }
                return recordsWithAssignedIds
            } catch (e) {
                console.error(e)
                throw e
            }
        })
    }
}
