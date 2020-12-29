import {DatabaseService} from "../lib/Storage/database.service";
import {Observable, ReplaySubject, Subject} from "rxjs";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {Hotkeys} from "../lib/Hotkeys/hotkeys.interface";
import { take} from "rxjs/operators";

export class SettingsService {
    private settingsReplaySubjects: { [setting: string]: ReplaySubject<any> } = {};
    private db: DatabaseService;

    constructor({db}: { db: DatabaseService }) {
        this.db = db;
    }

    public resolveSetting$<T>(
        settingName: string,
        defaultVal: T,
    ): ReplaySubject<T> {
        return this._resolveSetting$<T, ReplaySubject<T>>(
            settingName,
            () => new ReplaySubject<T>(1),
            this.settingsReplaySubjects,
            defaultVal
        )
    }

    public resolveReplaySubject$<T>(settingsName: string, defaultNoDb: T): ReplaySubject<T> {
        return this._resolveSetting$(
            settingsName,
            () => new ReplaySubject<T>(1),
            this.settingsReplaySubjects,
            defaultNoDb
        )
    }

    private _resolveSetting$<T,
        U extends Subject<any>>(
        settingName: string,
        constructor: () => U,
        dest: { [setting: string]: U },
        defaultWhenNotAvailable: T
    ): U {
        if (!dest[settingName]) {
            const settingReplaySubject = constructor();
            this.db.settings.where({name: settingName}).first().then(row => {
                if (row) {
                    try {
                        settingReplaySubject.next(JSON.parse(row.value))
                    } catch(e) {
                        settingReplaySubject.next(defaultWhenNotAvailable)
                    }
                } else {
                    settingReplaySubject.next(defaultWhenNotAvailable);
                }
            });
            settingReplaySubject.subscribe(value => {
                this.db.settings.put({name: settingName, value: JSON.stringify(value)}, settingName)
            });
            dest[settingName] = settingReplaySubject;
        }
        return dest[settingName];
    }

    get checkedOutDocuments$(): ReplaySubject<ds_Dict<boolean>> {
        return this.resolveSetting$<ds_Dict<boolean>>('checkedOutDocuments', {'cat-likes-tea': true})
    }
    get readingDocument$(): ReplaySubject<string | undefined> {
        return this.resolveSetting$<string | undefined>('readingDocument', undefined)
    }

    get hotkeys$(): ReplaySubject<Partial<Hotkeys<string[]>>> {
        return this.resolveSetting$<Partial<Hotkeys<string[]>>>('hotkeys', {});
    }

    get playbackSpeed$(): ReplaySubject<number> {
        return this.resolveSetting$('playbackSpeed', 0.5)
    }

    get completedSteps$(): ReplaySubject<string[]> {
        return this.resolveReplaySubject$<string[]>('introStepsCompleted', [])
    }

    get showTranslations$(): ReplaySubject<boolean> {
        return this.resolveReplaySubject$<boolean>('showTranslations', true);
    }

    get dailyGoal$() :ReplaySubject<number> {
        return this.resolveReplaySubject$<number>('dailyGoal', 24);
    }
}
export const observableLastValue = <T>(r: Observable<T>): Promise<T> => {
    return r.pipe(take(1)).toPromise();
}

