import {DatabaseService} from "../lib/Storage/database.service";
import {BehaviorSubject} from "rxjs";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {Hotkeys} from "../lib/Hotkeys/hotkeys.interface";

export class SettingsService {
    private settingsListeners: { [setting: string]: BehaviorSubject<any> } = {};
    private db: DatabaseService;

    constructor({db}: {db: DatabaseService}) {
        this.db = db;
    }

    private resolveSetting$<T>(settingName: string, defaultVal: T) {
        if (!this.settingsListeners[settingName]) {
            const behaviourSubject = new BehaviorSubject<T>(defaultVal);
            this.db.settings.where({name: settingName}).first().then(row => {
                if (row) {
                    behaviourSubject.next(JSON.parse(row.value))
                }
            });
            behaviourSubject.subscribe(value => {
                this.db.settings.put({name: settingName, value: JSON.stringify(value)}, settingName)
            });
            this.settingsListeners[settingName] = behaviourSubject;
        }
        return this.settingsListeners[settingName];
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
}