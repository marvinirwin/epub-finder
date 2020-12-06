import {DatabaseService} from "../lib/Storage/database.service";
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {Hotkeys} from "../lib/Hotkeys/hotkeys.interface";
import {skip, take} from "rxjs/operators";

export class SettingsService {
    private settingsBehaviourSubjects: { [setting: string]: BehaviorSubject<any> } = {};
    private settingsReplaySubjects: { [setting: string]: ReplaySubject<any> } = {};
    private db: DatabaseService;

    constructor({db}: { db: DatabaseService }) {
        this.db = db;
    }

    public resolveSetting$<T>(
        settingName: string,
        defaultVal: T,
    ): BehaviorSubject<T> {
        return this._resolveSetting$<T, BehaviorSubject<T>>(
            settingName,
            () => new BehaviorSubject<T>(defaultVal),
            this.settingsBehaviourSubjects,
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
        defaultWhenNoRow: T
    ): U {
        if (!dest[settingName]) {
            const behaviourSubject = constructor();
            this.db.settings.where({name: settingName}).first().then(row => {
                if (row) {
                    behaviourSubject.next(JSON.parse(row.value))
                } else {
                    behaviourSubject.next(defaultWhenNoRow);
                }
            });
            behaviourSubject.subscribe(value => {
                this.db.settings.put({name: settingName, value: JSON.stringify(value)}, settingName)
            });
            dest[settingName] = behaviourSubject;
        }
        return dest[settingName];
    }

    get checkedOutBooks$(): BehaviorSubject<ds_Dict<boolean>> {
        return this.resolveSetting$<ds_Dict<boolean>>('checkedOutBooks', {'cat-likes-tea': true})
    }

    get hotkeys$(): BehaviorSubject<Partial<Hotkeys<string[]>>> {
        return this.resolveSetting$<Partial<Hotkeys<string[]>>>('hotkeys', {});
    }

    get playbackSpeed$(): BehaviorSubject<number> {
        return this.resolveSetting$('playbackSpeed', 0.5)
    }

    get completedSteps$(): ReplaySubject<string[]> {
        return this.resolveReplaySubject$<string[]>('introStepsCompleted', [])
    }
}