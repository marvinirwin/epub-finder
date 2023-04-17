import {DatabaseService} from '../lib/Storage/database.service'
import {HistoryService} from '../lib/app-context/history.service'
import {Observable, of} from 'rxjs'
import {distinctUntilChanged, skip, take} from 'rxjs/operators'
import {UserSetting} from '@shared/'
import {putPersistableEntity} from "../lib/Storage/put-persistable-entity";


export type SettingType = 'url' | 'indexedDB' | 'REST';



export class SettingGetSet<T> {
    constructor(
        public name: string,
        public get: () => Promise<T> | T,
        public set: (v: T) => Promise<void> | void,
        private changed$: Observable<any>,
        private fetchedSettings$: Observable<Map<string, UserSetting>>
    ) {
        const settingsPromise =
        changed$
            .pipe(
                skip(1),
                distinctUntilChanged((previous, after) => {
                    return previous.href === after.href
                }),
            )
            .subscribe(async (v) => {
                this.set(await get())
            })
    }

    public static FromSettingName<SettingRepository extends SettingType, Value>(
        historyService: HistoryService,
        databaseService: DatabaseService,
        type: SettingRepository,
        name: string,
        defaultWhenNotAvailable: Value,
        fetchedSettings$: Observable<Map<string, UserSetting>>
    ) {
        const settingsPromise = fetchedSettings$.pipe(take(1)).toPromise()
        switch (type) {
            case 'indexedDB':
                return new SettingGetSet<Value>(
                    name,
                    () =>
                        new Promise((resolve, reject) =>
                            settingsPromise
                                .then(map => [map.get(name)])
                                .then((rows) => {
                                        const row = rows[0]
                                        if (row) {
                                            try {
                                                resolve(row.value)
                                            } catch (e) {
                                                resolve(defaultWhenNotAvailable)
                                            }
                                        } else {
                                            resolve(defaultWhenNotAvailable)
                                        }
                                    },
                                ),
                        ),
                    async (value: Value) => {
                        await putPersistableEntity<UserSetting>({
                            entity: 'userSettings',
                            record: {name, value},
                        })
                    },
                    of(),
                    fetchedSettings$
                )
            case 'REST':
                throw new Error('Not implemented')
            case 'url':
                return new SettingGetSet<Value>(
                    name,
                    () => {
                        const value = historyService.get(name)
                        if (value === null) {
                            return defaultWhenNotAvailable
                        }
                        try {
                            return JSON.parse(value)
                        } catch (e) {
                            return defaultWhenNotAvailable
                        }
                    },
                    (v: Value) => {
                        historyService.set(name, JSON.stringify(v))
                    },
                    historyService.url$,
                    fetchedSettings$
                )
            default:
                throw new Error(`Unknown setting get/set type ${type}`)
        }
    }
}
