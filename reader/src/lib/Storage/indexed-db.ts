import {DatabaseService} from "./database.service";
import Dexie from "dexie";


export class IndexDBManager<T> {
    constructor(
        public db: DatabaseService,
        public table: Dexie.Table<T, number>,
        public getId: (v: T) => number | undefined,
        public assignId: (newId: number, o: T) => T) {
    }
    load(where: (t: Dexie.Table<T, number>) => Promise<T[]>): Promise<T[]> {
        return where(this.table)
    }

    async upsert(m: T | T[], isMeWhere: (t: Dexie.Table<T, number>) => Promise<T[]>) {
        return this.db.transaction('rw', this.table, async () => {
            try {
                const presentRecords = await isMeWhere(this.table);
                // If I am already here, delete
                const keys: number[] = [];
                presentRecords.map(this.getId).forEach(n => n !== undefined && keys.push(n));
                await this.table.bulkDelete(keys);
                const recordsToPut = Array.isArray(m) ? m : [m];
                const recordsWithAssignedIds = [];
                for (let i = 0; i < recordsToPut.length; i++) {
                    // WHat's the difference between put and add
                    const recordToInsert = recordsToPut[i];
                    const id = this.getId(recordToInsert);
                    let newId;
                    if (id) {
                        newId = await this.table.put(recordToInsert, id);
                    } else {
                        // @ts-ignore If the id property is present, but undefined it will error when inserted
                        if (recordToInsert.hasOwnProperty('id')) delete recordToInsert.id;
                        newId = await this.table.add(recordToInsert);

                    }
                    recordsWithAssignedIds.push(this.assignId(newId, recordToInsert));
                }
                return recordsWithAssignedIds;
            } catch(e) {
                console.error(e);
                throw e;
            }
        })
    }

    delete(isMeWhere: (t: Dexie.Table<T, number>) => Promise<T[]>) {
        return this.db.transaction('rw', this.table, async () => {
            const presentRecords = await isMeWhere(this.table);
            const keys: number[] = [];
            presentRecords.map(this.getId).forEach(n => (n !== undefined) && keys.push(n));
            await this.table.bulkDelete(keys)
        })
    }
}
