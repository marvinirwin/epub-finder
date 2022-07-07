import { DatabaseService } from '../lib/Storage/database.service'
import { Observable, ReplaySubject } from 'rxjs'
import { ds_Dict } from '../lib/delta-scan/delta-scan.module'
import { Hotkeys } from '../lib/hotkeys/hotkeys.interface'
import { distinct, distinctUntilChanged, skip, take } from 'rxjs/operators'
import { HistoryService } from '../lib/app-context/history.service'
import { SettingGetSet, SettingType } from './setting-get-set'
import { MapSubject } from './map-subject'
import { FlashCardType } from '../lib/quiz/hidden-quiz-fields'
import { TextToSpeechConfig } from "languagetrainer-server/src/shared"

const settingSubject = <T>(getSet: SettingGetSet<T>): ReplaySubject<T> => {
    const settingReplaySubject = new ReplaySubject<T>(1)
    Promise.resolve(getSet.get()).then((value) => {
        settingReplaySubject.next(value)
    })
    settingReplaySubject
        .pipe(skip(1), distinctUntilChanged())
        .pipe()
        .subscribe((value) => {
            getSet.set(value)
        })
    return settingReplaySubject
}

export interface QuizCardConfiguration {
    flash_card_type: FlashCardType
}

export class SettingsService {
    private db: DatabaseService

    public historyService: HistoryService
    public drawerClosed$: ReplaySubject<boolean>
    public checkedOutDocuments$: ReplaySubject<ds_Dict<boolean>>
    public readingDocument$: ReplaySubject<string>
    public hotkeys$: ReplaySubject<Partial<Hotkeys<string[]>>>
    public playbackEndPercent$: MapSubject<number, string>
    public playbackStartPercent$: MapSubject<number, string>
    public playbackSpeed$: MapSubject<number, string>
    public completedSteps$: ReplaySubject<string[]>
    public pronunciationVideoSentenceHash$: ReplaySubject<string>
    public showTranslation$: ReplaySubject<boolean>
    public dailyGoal$: ReplaySubject<number>
    public showRomanization$: ReplaySubject<boolean>
    public frequencyWeight$: ReplaySubject<number>
    public directoryPath$: ReplaySubject<string>
    public readingLanguage$: ReplaySubject<string>
    public componentPath$: ReplaySubject<string>
    public manualIsRecording$: ReplaySubject<boolean>
    public spokenLanguage$: ReplaySubject<string>
    public selectedFrequencyDocuments$: ReplaySubject<string[]>
    public progressTreeRootId$: ReplaySubject<string>
    /**
     * Either the Id of a frequency document, or blank to use recognition progress
     */
    public selectedVocabulary$: ReplaySubject<string>
    public dateWeight$: ReplaySubject<number>
    public wordLengthWeight$: ReplaySubject<number>
    public scheduleTableWordFilterValue$: ReplaySubject<string>
    public scheduleTableShowUncounted$: ReplaySubject<boolean>
    public scheduleTableShowUnderDue$: ReplaySubject<boolean>
    public newQuizWordLimit$: ReplaySubject<number>
    public translationAttemptSentenceWeight$: ReplaySubject<number>
    public flashCardTypesRequiredToProgress$: ReplaySubject<FlashCardType[]>
    public currentIntroTab$: ReplaySubject<number>
    selectedExampleSegmentDocuments$: ReplaySubject<string[]>
    textToSpeechConfiguration$: ReplaySubject<TextToSpeechConfig | undefined>
    onlyReviewPresentText$: ReplaySubject<boolean>;
    maxReviewsPerDay$: ReplaySubject<number>;
    showSoundQuizCard$: ReplaySubject<boolean>;

    constructor({
        databaseService,
        historyService,
    }: {
        databaseService: DatabaseService
        historyService: HistoryService
    }) {
        this.db = databaseService
        this.historyService = historyService
        this.drawerClosed$ = this.createSetting$<boolean>(
            'drawerClosed',
            false,
            'indexedDB',
        )
        this.checkedOutDocuments$ = this.createSetting$<ds_Dict<boolean>>(
            'checkedOutDocuments',
            { 'cat-likes-tea': true },
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

        this.directoryPath$ = this.createSetting$<string>('dir', '', 'url')

        this.componentPath$ = this.createSetting$<string>('page', '', 'url')

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
            'textToSpeechConfiguration',
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
    }

    public createSetting$<T>(
        settingName: string,
        defaultVal: T,
        type: SettingType,
    ): ReplaySubject<T> {
        return settingSubject<T>(
            SettingGetSet.FromSettingName(
                this.historyService,
                this.db,
                type,
                settingName,
                defaultVal,
            ),
        )
    }
}

export const observableLastValue = <T>(r: Observable<T>): Promise<T> => {
    return r.pipe(take(1)).toPromise()
}
