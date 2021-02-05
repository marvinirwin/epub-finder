import {DatabaseService} from "../lib/Storage/database.service";
import {Observable, ReplaySubject, Subject} from "rxjs";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {Hotkeys} from "../lib/Hotkeys/hotkeys.interface";
import {distinct, distinctUntilChanged, skip, take} from "rxjs/operators";
import {HistoryService} from "../lib/history.service";
import {SettingGetSet, SettingType} from "./setting-get-set";

export class SettingsService {
    private settingsReplaySubjects: { [setting: string]: ReplaySubject<any> } = {};
    private db: DatabaseService;
    private historyService: HistoryService;

    constructor({db, historyService}: { db: DatabaseService, historyService: HistoryService }) {
        this.db = db;
        this.historyService = historyService;
    }

    public resolveSetting$<T>(
        settingName: string,
        defaultVal: T,
        type: SettingType,
    ): ReplaySubject<T> {
        return this._resolveSetting$<T>(
            SettingGetSet.FromSettingName(
                this.historyService,
                this.db,
                type,
                settingName,
                defaultVal
            )
            /*
                        settingName,
                        () => new ReplaySubject<T>(1),
                        this.settingsReplaySubjects,
                        defaultVal
            */
        )
    }

    /*
        public resolveReplaySubject$<T>(
            settingsName: string,
            defaultNoDb: T,
        ): ReplaySubject<T> {
            return this._resolveSetting$(
                settingsName,
                () => new ReplaySubject<T>(1),
                this.settingsReplaySubjects,
                defaultNoDb
            )
        }
    */

    private _resolveSetting$<T>(
        getSet: SettingGetSet<T>
    ): ReplaySubject<T> {
        if (!this.settingsReplaySubjects[getSet.name]) {
            const settingReplaySubject = new ReplaySubject<T>(1)
            Promise.resolve(getSet.get())
                .then(value => {
                    settingReplaySubject.next(value);
                })
            /*
                        this.db.settings.where({name: settingName}).first().then(row => {
                            if (row) {
                                try {
                                    settingReplaySubject.next(JSON.parse(row.value))
                                } catch (e) {
                                    settingReplaySubject.next(defaultWhenNotAvailable)
                                }
                            } else {
                                settingReplaySubject.next(defaultWhenNotAvailable);
                            }
                        });
            */
            settingReplaySubject.pipe(
                skip(1),
                distinctUntilChanged()
            ).pipe().subscribe(value => {
                getSet.set(value);
            });
            this.settingsReplaySubjects[getSet.name] = settingReplaySubject;
        }
        return this.settingsReplaySubjects[getSet.name];
    }

    get checkedOutDocuments$(): ReplaySubject<ds_Dict<boolean>> {
        return this.resolveSetting$<ds_Dict<boolean>>('checkedOutDocuments', {'cat-likes-tea': true}, 'indexedDB')
    }

    get readingDocument$(): ReplaySubject<string | undefined> {
        return this.resolveSetting$<string | undefined>('readingDocument', undefined, 'indexedDB')
    }

    get hotkeys$(): ReplaySubject<Partial<Hotkeys<string[]>>> {
        return this.resolveSetting$<Partial<Hotkeys<string[]>>>('hotkeys', {}, 'indexedDB');
    }

    get playbackSpeed$(): ReplaySubject<string> {
        return this.resolveSetting$('playbackSpeed', '0.5', 'url')
    }

    get completedSteps$(): ReplaySubject<string[]> {
        return this.resolveSetting$<string[]>('introStepsCompleted', [], 'indexedDB')
    }

    get showTranslation$(): ReplaySubject<boolean> {
        return this.resolveSetting$<boolean>('showTranslations', true, 'indexedDB');
    }

    get dailyGoal$(): ReplaySubject<number> {
        return this.resolveSetting$<number>('dailyGoal', 24, 'indexedDB');
    }

    get showRomanization$(): ReplaySubject<boolean> {
        return this.resolveSetting$<boolean>('showPinyin', true, 'indexedDB');
    }

    get directoryPath$(): ReplaySubject<string> {
        return this.resolveSetting$<string>('dir', '', 'url')
    }

    get componentPath$(): ReplaySubject<string> {
        return this.resolveSetting$<string>('page', '', 'url')
    }

    get manualIsRecording$(): ReplaySubject<boolean> {
        return this.resolveSetting$<boolean>('manualIsRecording', false, 'indexedDB')
    }

    get readingLanguage$(): ReplaySubject<string> {
        return this.resolveSetting$<string>('reading', 'Zh-Hans', 'url')
    }

    get spokenLanguage$(): ReplaySubject<string> {
        return this.resolveSetting$<string>('spoken', 'zh-CN', 'url')
    }

    get frequencyWeight$(): ReplaySubject<number> {
        return this.resolveSetting$<number>('frequencyWeight', 0.5, 'indexedDB');
    }

    get pronunciationVideoSentenceHash$(): ReplaySubject<string> {
        return this.resolveSetting$<string>('video', '', 'url');
    }

    get playbackStartPercent$(): ReplaySubject<string> {
        return this.resolveSetting$<string>('pbs', '0', 'url');
    }

    get playbackEndPercent$(): ReplaySubject<string> {
        return this.resolveSetting$<string>('pbe', '0', 'url');
    }
}

export const observableLastValue = <T>(r: Observable<T>): Promise<T> => {
    return r.pipe(take(1)).toPromise();
}

