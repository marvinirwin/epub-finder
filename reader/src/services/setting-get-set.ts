import {DatabaseService} from "../lib/Storage/database.service";
import {HistoryService} from "../lib/history.service";
import {Observable, of} from "rxjs";
import {distinctUntilChanged, skip} from "rxjs/operators";

export type SettingType = "url" | "indexedDB" | "REST";

export class SettingGetSet<T> {
    public static FromSettingName<
        SettingRepository extends SettingType,
        Value
        >(
        historyService: HistoryService,
        databaseService: DatabaseService,
        type: SettingRepository,
        name: string,
        defaultWhenNotAvailable: Value
    ) {
        switch(type) {
            case "indexedDB":
                return new SettingGetSet<Value>(
                    name,
                    () => new Promise((resolve, reject) => {
                        databaseService.settings.where({name}).first().then(row => {
                            if (row) {
                                try {
                                    resolve(JSON.parse(row.value))
                                } catch (e) {
                                    resolve(defaultWhenNotAvailable)
                                }
                            } else {
                                resolve(defaultWhenNotAvailable)
                            }
                        });
                    }),
                    async (value: Value) => {
                        await databaseService.settings.put({name, value: JSON.stringify(value)}, name)
                    },
                    of()
                )
            case "REST":
                throw new Error("Not implemented");
            case "url":
                return new SettingGetSet<Value>(
                    name,
                    () => {
                        const value = historyService.get(name);
                        if (value === null) {
                            return defaultWhenNotAvailable;
                        }
                        try {
                            return JSON.parse(value);
                        } catch(e) {
                            return defaultWhenNotAvailable;
                        }
                    },
                    (v: Value) => {
                        historyService.set(name, JSON.stringify(v));
                    },
                    historyService.url$
                )
            default:
                throw new Error(`Unknown setting get/set type ${type}`)
        }
    }

    constructor(
        public name: string,
        public get: () => Promise<T> | T,
        public set: (v: T) => Promise<void> | void,
        private changed$: Observable<any>
    ) {
        changed$.pipe(skip(1), distinctUntilChanged((previous, after) => {
            return previous.href === after.href;
        })).subscribe(async v => {
            this.set(await get())
        })
    }

}