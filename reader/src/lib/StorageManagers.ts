import {MyAppDatabase} from "./AppDB";
import Dexie from "dexie";

export class LocalStorageManager {
    constructor(public localStorageKey: string) {
    }

    getLocalStorageArray(): Array<any> {

        const a = this.tryParseLocalstorage();
        if (!Array.isArray(a)) {
            return [];
        }
        return a;
    }

    private tryParseLocalstorage(): any {
        try {
            return JSON.parse(localStorage.getItem(this.localStorageKey) || '');
        } catch (e) {
            return undefined;
        }
    }

    load<T>(create: (a: any) => T) {
        const stored = this.getLocalStorageArray();
        return stored.map(create);
    }

    upsert(isMe: (a: any) => boolean, meSerialized: any) {
        const serializedInstances = this.getLocalStorageArray();
        const currentMe = serializedInstances.find(serializedObject => isMe(serializedObject))
        if (currentMe) {

            const i = serializedInstances.indexOf(currentMe);
            serializedInstances[i] = meSerialized;
        } else {
            serializedInstances.push(meSerialized);
        }
        localStorage.setItem(this.localStorageKey, JSON.stringify(serializedInstances));
    }

    delete(isMe: (a: any) => boolean) {
        const serializedInstances = this.getLocalStorageArray();
        const currentMe = serializedInstances.filter(serializedObject => isMe(serializedObject))
        if (currentMe) {
            const i = serializedInstances.indexOf(currentMe);
            serializedInstances.splice(i, 1);
        } else {
            throw new Error("Not found in array, cannot delete")
        }
        localStorage.setItem(this.localStorageKey, JSON.stringify(serializedInstances));
    }
}

export class IndexDBManager<T> {
    constructor(
        public db: MyAppDatabase,
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
                debugger;
                // If I am already here, delete
                const keys: number[] = [];
                presentRecords.map(this.getId).forEach(n => n !== undefined && keys.push(n));
                await this.table.bulkDelete(keys);
                const recordsToPut = Array.isArray(m) ? m : [m];
                const recordsWithAssignedIds = [];
                for (let i = 0; i < recordsToPut.length; i++) {
                    // WHat's the difference between put and add
                    let recordToInsert = recordsToPut[i];
                    const id = await this.table.put(recordToInsert, this.getId(recordToInsert));
                    recordsWithAssignedIds.push(this.assignId(id, recordToInsert));
                }
                return recordsWithAssignedIds;
            } catch(e) {
                debugger;
                console.error(e);
                throw e;
            }
        })
    }

    delete(isMeWhere: (t: Dexie.Table<T, number>) => Promise<T[]>) {
        return this.db.transaction('rw', this.table, async () => {
            debugger;
            const presentRecords = await isMeWhere(this.table);
            let keys: number[] = [];
            presentRecords.map(this.getId).forEach(n => (n !== undefined) && keys.push(n));
            await this.table.bulkDelete(keys)
        })
    }
}
