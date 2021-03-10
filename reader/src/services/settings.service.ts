import {DatabaseService} from "../lib/Storage/database.service";
import {Observable, ReplaySubject, Subject} from "rxjs";
import {ds_Dict} from "../lib/delta-scan/delta-scan.module";
import {Hotkeys} from "../lib/hotkeys/hotkeys.interface";
import {distinct, distinctUntilChanged, skip, take} from "rxjs/operators";
import {HistoryService} from "../lib/history.service";
import {SettingGetSet, SettingType} from "./setting-get-set";
import {MapSubject} from "./map-subject";

const settingSubject = <T>(getSet: SettingGetSet<T>): ReplaySubject<T> => {
    const settingReplaySubject = new ReplaySubject<T>(1)
    Promise.resolve(getSet.get())
        .then(value => {
            settingReplaySubject.next(value);
        })
    settingReplaySubject.pipe(
        skip(1),
        distinctUntilChanged()
    ).pipe().subscribe(value => {
        getSet.set(value);
    });
    return settingReplaySubject;
};

export class SettingsService {
    private settingsReplaySubjects: { [setting: string]: ReplaySubject<any> } = {};
    private db: DatabaseService;

    public historyService: HistoryService;
    public drawerClosed$: ReplaySubject<boolean>;
    public checkedOutDocuments$: ReplaySubject<ds_Dict<boolean>>;
    public readingDocument$: ReplaySubject<string>;
    public hotkeys$: ReplaySubject<Partial<Hotkeys<string[]>>>;
    public playbackEndPercent$: MapSubject<number, string>;
    public playbackStartPercent$: MapSubject<number, string>;
    public playbackSpeed$: MapSubject<number, string>;
    public completedSteps$: ReplaySubject<string[]>;
    public pronunciationVideoSentenceHash$: ReplaySubject<string>;
    public showTranslation$: ReplaySubject<boolean>;
    public dailyGoal$: ReplaySubject<number>;
    public showRomanization$: ReplaySubject<boolean>;
    public frequencyWeight$: ReplaySubject<number>;
    public directoryPath$: ReplaySubject<string>;
    public readingLanguage$: ReplaySubject<string>;
    public componentPath$: ReplaySubject<string>;
    public manualIsRecording$: ReplaySubject<boolean>;
    public spokenLanguage$: ReplaySubject<string>;
    public selectedFrequencyDocuments$: ReplaySubject<string[]>;
    public progressTreeRootId$: ReplaySubject<string>;
    /**
     * Either the Id of a frequency document, or blank to use recognition progress
     */
    public selectedVocabulary$: ReplaySubject<string>;
    public dateWeight$: ReplaySubject<number>;
    public wordLengthWeight$: ReplaySubject<number>;
    public scheduleTableWordFilterValue$: ReplaySubject<string>;
    public scheduleTableShowUncounted$: ReplaySubject<boolean>;
    public scheduleTableShowUnderDue$: ReplaySubject<boolean>;
    public newQuizWordLimit$: ReplaySubject<number>;

    constructor({db, historyService}: { db: DatabaseService, historyService: HistoryService }) {
        this.db = db;
        this.historyService = historyService;
        this.drawerClosed$ = this.createSetting$<boolean>('drawerClosed', false, 'indexedDB');
        this.checkedOutDocuments$ = this.createSetting$<ds_Dict<boolean>>('checkedOutDocuments', {'cat-likes-tea': true}, 'indexedDB')

        this.playbackStartPercent$ = MapSubject.StringifyMapSubject<number>(this.createSetting$<string>('pbs', '0', 'indexedDB'));

        this.playbackEndPercent$ = MapSubject.StringifyMapSubject<number>(this.createSetting$<string>('pbe', '0', 'indexedDB'));

        this.playbackSpeed$ = MapSubject.StringifyMapSubject<number>(this.createSetting$<string>('playbackSpeed', '0.5', 'indexedDB'))

        this.pronunciationVideoSentenceHash$ = this.createSetting$<string>('video', '', 'url');

        this.readingDocument$ = this.createSetting$<string>('readingDocument', '', 'url')

        this.directoryPath$ = this.createSetting$<string>('dir', '', 'url')

        this.componentPath$ = this.createSetting$<string>('page', '', 'url')

        this.readingLanguage$ = this.createSetting$<string>('reading', 'zh-Hans', 'url')

        this.spokenLanguage$ = this.createSetting$<string>('spoken', 'zh-CN', 'url')

        this.hotkeys$ = this.createSetting$<Partial<Hotkeys<string[]>>>('hotkeys', {}, 'indexedDB');

        this.completedSteps$ = this.createSetting$<string[]>('introStepsCompleted', [], 'indexedDB')

        this.showTranslation$ = this.createSetting$<boolean>('showTranslations', true, 'indexedDB');

        this.dailyGoal$ = this.createSetting$<number>('dailyGoal', 24, 'indexedDB');

        this.showRomanization$ = this.createSetting$<boolean>('showPinyin', true, 'indexedDB');

        this.manualIsRecording$ = this.createSetting$<boolean>('manualIsRecording', false, 'indexedDB')

        this.frequencyWeight$ = this.createSetting$<number>('frequencyWeight', 0.5, 'indexedDB');

        this.dateWeight$ = this.createSetting$<number>('dateWeight', 0.5, 'indexedDB');

        this.wordLengthWeight$ = this.createSetting$<number>('wordLengthWeight', 0.5, 'indexedDB');

        this.selectedFrequencyDocuments$ = this.createSetting$<string[]>('selectedFrequencyDocuments', [], 'indexedDB')

        this.progressTreeRootId$ = this.createSetting$<string>('progressTreeRoot', '', 'indexedDB')

        this.selectedVocabulary$ = this.createSetting$<string>('selectedVocabulary', '', 'indexedDB')

        this.scheduleTableWordFilterValue$ = this.createSetting$<string>('scheduleTableWordFilterValue', '', 'indexedDB')

        this.scheduleTableShowUncounted$ = this.createSetting$<boolean>('scheduleTableShowUncounted', false, 'indexedDB')
        this.scheduleTableShowUnderDue$ = this.createSetting$<boolean>('scheduleTableShowUnderDue', false, 'indexedDB')
        this.newQuizWordLimit$ = this.createSetting$<number>('newQuizWordLimit', 10, 'indexedDB')
    }

    public createSetting$<T>(
        settingName: string,
        defaultVal: T,
        type: SettingType,
    ): ReplaySubject<T> {
        return settingSubject<T>(SettingGetSet.FromSettingName(
            this.historyService,
            this.db,
            type,
            settingName,
            defaultVal
        ))
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

}

export const observableLastValue = <T>(r: Observable<T>): Promise<T> => {
    return r.pipe(take(1)).toPromise();
}

