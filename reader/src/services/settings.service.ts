import {DatabaseService} from '../lib/Storage/database.service'
import {merge, Observable, ReplaySubject} from 'rxjs'
import {ds_Dict} from '../lib/delta-scan/delta-scan.module'
import {Hotkeys} from '../lib/hotkeys/hotkeys.interface'
import {distinctUntilChanged, shareReplay, switchMap} from 'rxjs/operators'
import {HistoryService} from '../lib/app-context/history.service'
import {SettingGetSet, SettingType} from './setting-get-set'
import {MapSubject} from './map-subject'
import {FlashCardType} from '../lib/quiz/hidden-quiz-fields'
import {TextToSpeechConfig, UserSetting} from "@shared/"
import {LoggedInUserService} from "../lib/auth/logged-in-user.service";
import {queryPersistableEntity} from "../lib/Storage/queryPersistableEntity";

export type SettingObject<T> = {
    default$: ReplaySubject<T>,
    user$: ReplaySubject<T>,
    obs$: Observable<T>
}
export const GetSettingObject = <T>() => {
    const default$ = new ReplaySubject<T>(1);
    const user$ = new ReplaySubject<T>(1);
    return {
        user$,
        default$,
        obs$: merge(default$, user$).pipe(shareReplay(1))
    }
}

const settingSubject = <T>(getSet: SettingGetSet<T>): SettingObject<T> => {
    const settingReplaySubject = GetSettingObject<T>()
    Promise.resolve(getSet.get()).then((value) => {
        settingReplaySubject.default$.next(value)
    })
    settingReplaySubject.user$
        .pipe(distinctUntilChanged())
        .subscribe((value) => {
            getSet.set(value)
        })
    return settingReplaySubject
}


export class SettingsService {
    private db: DatabaseService

    public historyService: HistoryService
    public drawerClosed$: SettingObject<boolean>
    public checkedOutDocuments$: SettingObject<ds_Dict<boolean>>
    public readingDocument$: SettingObject<string>
    public hotkeys$: SettingObject<Partial<Hotkeys<string[]>>>
    public playbackEndPercent$: MapSubject<number, string>
    public playbackStartPercent$: MapSubject<number, string>
    public playbackSpeed$: MapSubject<number, string>
    public completedSteps$: SettingObject<string[]>
    public pronunciationVideoSentenceHash$: SettingObject<string>
    public showTranslation$: SettingObject<boolean>
    public dailyGoal$: SettingObject<number>
    public showRomanization$: SettingObject<boolean>
    public frequencyWeight$: SettingObject<number>
    public readingLanguage$: SettingObject<string>
    public componentPath$: ReplaySubject<string>
    public manualIsRecording$: SettingObject<boolean>
    public spokenLanguage$: SettingObject<string>
    public selectedFrequencyDocuments$: SettingObject<string[]>
    public progressTreeRootId$: SettingObject<string>
    /**
     * Either the Id of a frequency document, or blank to use recognition progress
     */
    public selectedVocabulary$: SettingObject<string>
    public dateWeight$: SettingObject<number>
    public wordLengthWeight$: SettingObject<number>
    public scheduleTableWordFilterValue$: SettingObject<string>
    public scheduleTableShowUncounted$: SettingObject<boolean>
    public scheduleTableShowUnderDue$: SettingObject<boolean>
    public newQuizWordLimit$: SettingObject<number>
    public translationAttemptSentenceWeight$: SettingObject<number>
    public flashCardTypesRequiredToProgress$: SettingObject<FlashCardType[]>
    public currentIntroTab$: SettingObject<number>
    selectedExampleSegmentDocuments$: SettingObject<string[]>
    textToSpeechConfiguration$: SettingObject<TextToSpeechConfig | undefined>
    onlyReviewPresentText$: SettingObject<boolean>;
    maxReviewsPerDay$: SettingObject<number>;
    showSoundQuizCard$: SettingObject<boolean>;
    fetchedSettingsPromise$: Observable<Map<string, UserSetting>>;

    constructor({
                    databaseService,
                    historyService,
                    loggedInUserService
                }: {
        databaseService: DatabaseService
        historyService: HistoryService
        loggedInUserService: LoggedInUserService
    }) {
        this.fetchedSettingsPromise$ = loggedInUserService.isLoggedIn$.pipe(
            switchMap(() =>
                queryPersistableEntity<UserSetting>({
                        entity: 'userSettings',
                        skip: 0,
                        take: 100,
                    }
                ).then(records => new Map(records.map(userSettingRecord => [userSettingRecord.name, userSettingRecord])))
            ),
            shareReplay(1)
        )
        this.db = databaseService
        this.historyService = historyService
        this.drawerClosed$ = this.createSetting$<boolean>(
            'drawerClosed',
            false,
            'indexedDB',
        );

        this.checkedOutDocuments$ = this.createSetting$<ds_Dict<boolean>>(
            'checkedOutDocuments',
            {'cat-likes-tea': true},
            'indexedDB',
        )

        this.playbackStartPercent$ = MapSubject.StringifyMapSubject<number>(
            this.createSetting$<string>('pbs', '0', 'indexedDB'),
        )

        this.playbackEndPercent$ = MapSubject.StringifyMapSubject<number>(
            this.createSetting$<string>('pbe', '0', 'indexedDB'),
        )

        this.playbackSpeed$ = MapSubject.StringifyMapSubject<number>(
            this.createSetting$<string>('playbackSpeed', '0.5', 'indexedDB'),
        )

        this.pronunciationVideoSentenceHash$ = this.createSetting$<string>(
            'video',
            '',
            'url',
        )

        this.readingDocument$ = this.createSetting$<string>(
            'readingDocument',
            '',
            'indexedDB',
        )

        this.readingLanguage$ = this.createSetting$<string>(
            'reading',
            'zh-Hans',
            'indexedDB',
        )

        this.spokenLanguage$ = this.createSetting$<string>(
            'spoken',
            'zh-CN',
            'indexedDB',
        )

        this.hotkeys$ = this.createSetting$<Partial<Hotkeys<string[]>>>(
            'hotkeys',
            {},
            'indexedDB',
        )

        this.completedSteps$ = this.createSetting$<string[]>(
            'introStepsCompleted',
            [],
            'indexedDB',
        )

        this.showTranslation$ = this.createSetting$<boolean>(
            'showTranslations',
            true,
            'indexedDB',
        )

        this.dailyGoal$ = this.createSetting$<number>(
            'dailyGoal',
            24,
            'indexedDB',
        )

        this.showRomanization$ = this.createSetting$<boolean>(
            'showPinyin',
            true,
            'indexedDB',
        )

        this.manualIsRecording$ = this.createSetting$<boolean>(
            'manualIsRecording',
            false,
            'indexedDB',
        )

        this.frequencyWeight$ = this.createSetting$<number>(
            'frequencyWeight',
            0.5,
            'indexedDB',
        )

        this.translationAttemptSentenceWeight$ = this.createSetting$<number>(
            'translationAttemptSentenceWeight',
            0.5,
            'indexedDB',
        )

        this.dateWeight$ = this.createSetting$<number>(
            'dateWeight',
            0.5,
            'indexedDB',
        )

        this.wordLengthWeight$ = this.createSetting$<number>(
            'wordLengthWeight',
            0.5,
            'indexedDB',
        )

        this.selectedFrequencyDocuments$ = this.createSetting$<string[]>(
            'selectedFrequencyDocuments',
            [],
            'indexedDB',
        )

        this.progressTreeRootId$ = this.createSetting$<string>(
            'progressTreeRoot',
            '',
            'indexedDB',
        )

        this.selectedVocabulary$ = this.createSetting$<string>(
            'selectedVocabulary',
            '',
            'indexedDB',
        )

        this.scheduleTableWordFilterValue$ = this.createSetting$<string>(
            'scheduleTableWordFilterValue',
            '',
            'indexedDB',
        )

        this.scheduleTableShowUncounted$ = this.createSetting$<boolean>(
            'scheduleTableShowUncounted',
            false,
            'indexedDB',
        )
        this.scheduleTableShowUnderDue$ = this.createSetting$<boolean>(
            'scheduleTableShowUnderDue',
            false,
            'indexedDB',
        )
        this.newQuizWordLimit$ = this.createSetting$<number>(
            'newQuizWordLimit',
            10,
            'indexedDB',
        )

        this.flashCardTypesRequiredToProgress$ = this.createSetting$<FlashCardType[]>(
            'flashCardTypesRequiredToProgress',
            [
                FlashCardType.WordExamplesAndPicture,
                FlashCardType.KnownLanguage,
                FlashCardType.LearningLanguageAudio
            ],
            'indexedDB',
        )

        this.currentIntroTab$ = this.createSetting$<number>(
            'currentIntroTab',
            0,
            'indexedDB',
        );

        this.selectedExampleSegmentDocuments$ = this.createSetting$<string[]>(
            'selectedExampleSegmentDocuments',
            [],
            'indexedDB',
        );
        this.textToSpeechConfiguration$ = this.createSetting$<TextToSpeechConfig | undefined>(
            'textToSpeechConfiguration',
            undefined,
            'indexedDB',
        );
        this.onlyReviewPresentText$ = this.createSetting$<boolean>(
            'onlyReviewPresentText',
            false,
            'indexedDB',
        );
        this.maxReviewsPerDay$ = this.createSetting$<number>(
            'maxReviewsPerDay',
            20,
            'indexedDB',
        );

        this.showSoundQuizCard$ = this.createSetting$<boolean>(
            'showSoundQuizCard',
            true,
            'indexedDB',
        );
        this.componentPath$ = new ReplaySubject<string>(window.location.pathname.split('/').filter(x => x).length)
        // THIS IS A HACK
        this.componentPath$.subscribe()
    }

    public createSetting$<T>(
        settingName: string,
        defaultVal: T,
        type: SettingType,
    ): SettingObject<T> {
        return settingSubject<T>(
            SettingGetSet.FromSettingName(
                this.historyService,
                this.db,
                type,
                settingName,
                defaultVal,
                this.fetchedSettingsPromise$
            ),
        )
    }
}

