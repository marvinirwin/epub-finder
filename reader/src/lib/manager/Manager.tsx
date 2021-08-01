import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { Dictionary } from 'lodash'
import { map, shareReplay } from 'rxjs/operators'
import { DatabaseService } from '../Storage/database.service'
import React from 'react'
import { ICard } from '../../../../server/src/shared/ICard'
import { IndexDBManager } from '../Storage/indexed-db'
import { AtomMetadata } from '../../../../server/src/shared/atom-metadata.interface.ts/atom-metadata'
import { AudioManager } from './AudioManager'
import CardsRepository from './cards.repository'
import { OpenDocumentsService } from './open-documents.service'
import { BrowserInputsService } from '../hotkeys/browser-inputs-service'
import { InputPage } from './manager-connections/Input-Page'
import { CardPage } from './manager-connections/Card-Page'
import { CreatedSentenceManager } from './CreatedSentenceManager'
import { AppContext } from '../app-context/AppContext'
import { RecordRequest } from '../util/RecordRequest'
import { Highlighter } from '../highlighting/Highlighter'
import { HotKeyEvents } from '../hotkeys/HotKeyEvents'
import { ModesService } from '../modes/modes.service'
import { PronunciationVideoService } from '../../components/pronunciation-video/pronunciation-video.service'
import { ObservableService } from '../../services/observable.service'
import { HighlighterService } from '../highlighting/highlighter.service'
import { removePunctuation, TemporaryHighlightService } from '../highlighting/temporary-highlight.service'
import { RGBA } from '../highlighting/color.service'
import { EditingVideoMetadataService } from '../../services/editing-video-metadata.service'
import { SettingsService } from '../../services/settings.service'
import { HotkeysService } from '../../services/hotkeys.service'
import { HighlightPronunciationVideoService } from '../../services/highlight-pronunciation-video.service'
import { WordRecognitionProgressRepository } from '../schedule/word-recognition-progress.repository'
import { PronunciationProgressRepository } from '../schedule/pronunciation-progress.repository'
import { QuizResultService } from '../quiz/quiz-result.service'
import { HighlightPronunciationProgressService } from '../highlighting/highlight-pronunciation-progress.service'
import { HighlightRecollectionDifficultyService } from '../highlighting/highlight-recollection-difficulty.service'
import { TestHotkeysService } from '../hotkeys/test-hotkeys.service'
import { IntroService } from '../intro/intro.service'
import { IntroSeriesService } from '../intro/intro-series.service'
import { IntroHighlightService } from '../intro/intro-highlight.service'
import { LoggedInUserService } from '../auth/loggedInUserService'
import { DocumentCheckingOutService } from '../../components/library/document-checking-out.service'
import { DocumentRepository } from '../documents/document.repository'
import { LibraryService } from './library.service'
import { DroppedFilesService } from '../uploading-documents/dropped-files.service'
import { UploadingDocumentsService } from '../uploading-documents/uploading-documents.service'
import { DocumentSelectionService } from '../document-selection/document-selection.service'
import { AlertMessage, AlertsService } from '../../services/alerts.service'
import { ReadingDocumentService } from './reading-document.service'
import { RequestRecordingService } from '../../components/pronunciation-video/request-recording.service'
import { TreeMenuService } from '../../services/tree-menu.service'
import { ScheduleService } from '../schedule/schedule.service'
import { QuizService } from '../../components/quiz/quiz.service'
import { ExampleSegmentsService } from '../quiz/example-segments.service'
import { ImageSearchService } from '../image-search/image-search.service'
import { QuizCardScheduleRowsService } from '../schedule/quiz-card-schedule-rows.service'
import { GoalsService } from '../quiz/goals.service'
import { ActiveSentenceService } from '../sentences/active-sentence.service'
import { VisibleService } from './visible.service'
import { ElementAtomMetadataIndex } from '../../services/element-atom-metadata.index'
import { WordMetadataMapService } from '../../services/word-metadata-map.service'
import { AtomElementEventsService } from '../user-interface/atom-element-events.service'
import { ToastMessage, ToastMessageService } from '../user-interface/toast-message.service'
import { ProgressItemService } from '../../components/item-in-progress/progress-item.service'
import { IsRecordingService } from '../audio/is-recording.service'
import { HistoryService } from '../app-context/history.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { SpeechPracticeService } from '../audio/speech-practice.service'
import { MicFeedbackService } from '../audio/mic-feedback.service'
import { ModalService } from '../user-interface/modal.service'
import { VideoMetadataRepository } from '../../services/video-metadata.repository'
import { VideoMetadataHighlight } from '../highlighting/video-metadata.highlight'
import { MousedOverWordHighlightService } from '../highlighting/moused-over-word-highlight.service'
import { IgnoredWordsRepository } from '../schedule/ignored-words.repository'
import { FrequencyDocumentsRepository } from '../documents/frequency-documents.repository'
import { AllWordsRepository } from '../language/all-words.repository'
import { QuizHighlightService } from '../highlighting/quiz-highlight.service'
import { FrequencyTreeService } from '../learning-tree/frequency-tree.service'
import { VocabService } from '../language/vocab.service'
import { FilterScheduleTableRowsService } from '../schedule/filter-schedule-table-rows.service'
import { SortedLimitScheduleRowsService } from './sorted-limit-schedule-rows.service'
import { WordCardModalService } from '../word-card/word-card-modal.service'
import { LoadingMessagesService } from '../loading/loading-messages.service'
import { NotableSubsequencesService } from '../sentences/notable-subsequences.service'
import { WordsService } from '../language/words.service'
import { TabulationConfigurationService } from '../language/language-maps/tabulation-configuration.service'
import { TranslationAttemptScheduleService } from '../schedule/translation-attempt-schedule.service'
import { TranslationAttemptRepository } from '../schedule/translation-attempt.repository'
import { QuizScheduleRowData } from '../schedule/schedule-row'
import { TranslationAttemptService } from '../../components/translation-attempt/translation-attempt.service'
import { WeightedVocabService } from '../language/weighted-vocab.service'
import { GeneralToastMessageService } from '../user-interface/general-toast-message.service'
import { SelectedVirtualTabulationsService } from './selected-virtual-tabulations.service'
import { HotkeyModeService } from '../hotkeys/hotkey-mode.service'
import { OnSelectService } from '../user-interface/on-select.service'
import { TimeService } from '../time/time.service'
import { AdvanceTimeService } from '../time/advance-time.service'
import { FlashCardLearningTargetsService } from '../schedule/learning-target/flash-card-learning-targets.service'
import { CustomWordsRepository } from '../schedule/learning-target/custom-words.repository'
import { TabulationService } from '../tabulation/tabulation.service'
import { FlashCardTypesRequiredToProgressService } from '../schedule/required-to-progress.service'
import { ReadingProgressService } from '../tabulation/reading-progress.service'
import { CsvService } from './csv.service'
import { KnownWordsRepository } from '../schedule/known-words.repository'
import {LeaderBoardService} from "../../components/leader-board.service";

export type CardDB = IndexDBManager<ICard>

/*
const addHighlightedPinyin = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addVideoIndex = debounce((obs$: Subject<number | undefined>, index: number | undefined) => obs$.next(index), 100)
*/

export class Manager {
    public cardDBManager = new IndexDBManager<ICard>(
        this.databaseService,
        'cards',
        (c: ICard) => c.id,
        (i: number, c: ICard) => ({ ...c, id: i }),
    )
    public hotkeyEvents: HotKeyEvents
    public audioRecordingService: AudioManager
    public cardsRepository: CardsRepository
    public openDocumentsService: OpenDocumentsService
    public quizCardScheduleService: ScheduleService<QuizScheduleRowData>
    public quizResultService: QuizResultService
    public createdSentenceManager: CreatedSentenceManager
    public browserInputsService: BrowserInputsService
    public visibleElementsService: VisibleService
    public loggedInUserService = new LoggedInUserService()
    public highlighter: Highlighter
    public pronunciationProgressService: PronunciationProgressRepository
    public wordRecognitionProgressRepository: WordRecognitionProgressRepository
    public introService: IntroService
    public alertsService = new AlertsService()
    public requestRecordingService: RequestRecordingService
    public treeMenuService: TreeMenuService<any, { value: any }>
    public quizCardScheduleRowsService: QuizCardScheduleRowsService

    public observableService = new ObservableService()

    public imageSearchService = new ImageSearchService()

    public progressItemService = new ProgressItemService()

    readingwordElementMap!: Observable<Dictionary<AtomMetadata[]>>
    characterPagewordElementMap$ = new Subject<Dictionary<AtomMetadata[]>>()
    highlightAllWithDifficultySignal$ = new BehaviorSubject<boolean>(true)
    libraryService: LibraryService
    modesService = new ModesService()
    pronunciationVideoService = new PronunciationVideoService()
    public editingVideoMetadataService: EditingVideoMetadataService
    public highlighterService: HighlighterService
    settingsService: SettingsService
    hotkeysService: HotkeysService
    temporaryHighlightService: TemporaryHighlightService
    public introSeriesService: IntroSeriesService
    public introHighlightSeries: IntroHighlightService
    droppedFilesService: DroppedFilesService
    documentCheckingOutService: DocumentCheckingOutService
    documentRepository: DocumentRepository
    uploadingDocumentsService: UploadingDocumentsService
    documentSelectionService: DocumentSelectionService
    readingDocumentService: ReadingDocumentService
    exampleSentencesService: ExampleSegmentsService
    public quizService: QuizService
    public goalsService: GoalsService
    public activeSentenceService: ActiveSentenceService
    public elementAtomMetadataIndex: ElementAtomMetadataIndex
    public wordMetadataMapService: WordMetadataMapService
    public alertToastMessageService: ToastMessageService<AlertMessage>
    public isRecordingService: IsRecordingService
    public historyService: HistoryService
    public languageConfigsService: LanguageConfigsService
    public speechPracticeService: SpeechPracticeService
    public micFeedbackService: MicFeedbackService
    public modalService = new ModalService()
    public videoMetadataRepository: VideoMetadataRepository
    public mousedOverWordHighlightService: MousedOverWordHighlightService
    public ignoredWordsRepository: IgnoredWordsRepository
    public frequencyDocumentsRepository: FrequencyDocumentsRepository
    public hotkeyModeService: HotkeyModeService
    public allWordsRepository: AllWordsRepository
    public progressTreeService: FrequencyTreeService
    public quizHighlightService: QuizHighlightService
    public vocabService: VocabService
    public filterScheduleTableRowsService: FilterScheduleTableRowsService
    sortedLimitedQuizScheduleRowsService: SortedLimitScheduleRowsService
    wordCardModalService: WordCardModalService
    public loadingMessagesService: LoadingMessagesService
    notableSubsequencesService: NotableSubsequencesService
    wordsService: WordsService
    tabulationConfigurationService: TabulationConfigurationService
    translationAttemptScheduleService: TranslationAttemptScheduleService
    translationAttemptRepository: TranslationAttemptRepository
    translationAttemptService: TranslationAttemptService
    weightedVocabService: WeightedVocabService
    generalToastMessageService: GeneralToastMessageService
    selectedVirtualTabulationsService: SelectedVirtualTabulationsService
    onSelectService: OnSelectService
    timeService: TimeService
    advanceTimeService: AdvanceTimeService
    flashCardLearningTargetsService: FlashCardLearningTargetsService
    customWordsRepository: CustomWordsRepository
    tabulationService: TabulationService
    flashCardTypesRequiredToProgressService: FlashCardTypesRequiredToProgressService
    readingProgressService: ReadingProgressService
    csvService: CsvService
    knownWordsRepository: KnownWordsRepository
    leaderBoardService: LeaderBoardService;

    constructor(public databaseService: DatabaseService, { audioSource }: AppContext) {
        this.customWordsRepository = new CustomWordsRepository(this)
        this.timeService = new TimeService()
        this.ignoredWordsRepository = new IgnoredWordsRepository(this)
        this.alertToastMessageService = new ToastMessageService({
            addToastMessage$: this.alertsService.newAlerts$.pipe(
                map((alert) => new ToastMessage(10000, alert)),
                shareReplay(1),
            ),
        })
        this.generalToastMessageService = new GeneralToastMessageService()
        this.hotkeyModeService = new HotkeyModeService(this)
        this.historyService = new HistoryService()
        this.settingsService = new SettingsService(this)
        this.languageConfigsService = new LanguageConfigsService(this)
        this.allWordsRepository = new AllWordsRepository(this);
        this.knownWordsRepository = new KnownWordsRepository(this);
        this.flashCardTypesRequiredToProgressService = new FlashCardTypesRequiredToProgressService(this)
        this.settingsService.spokenLanguage$.subscribe(audioSource.learningToKnownSpeech$)
        this.treeMenuService = new TreeMenuService<any, { value: any }>(this)
        this.hotkeysService = new HotkeysService(this)
        this.hotkeyEvents = new HotKeyEvents(this)
        this.activeSentenceService = new ActiveSentenceService(this)
        this.browserInputsService = new BrowserInputsService({
            hotkeys$: this.hotkeysService.mapHotkeysWithDefault(
                HotKeyEvents.defaultHotkeys(),
                this.hotkeyEvents.hotkeyActions(),
            ),
            activeSentenceService: this.activeSentenceService,
            settingsService: this.settingsService,
        })
        this.onSelectService = new OnSelectService(this)
        this.documentRepository = new DocumentRepository(this)
        this.cardsRepository = new CardsRepository(this)
        this.pronunciationProgressService = new PronunciationProgressRepository(this)
        this.wordRecognitionProgressRepository = new WordRecognitionProgressRepository(this)
        this.openDocumentsService = new OpenDocumentsService(this)
        this.selectedVirtualTabulationsService = new SelectedVirtualTabulationsService(this)
        this.visibleElementsService = new VisibleService({
            componentInView$: this.treeMenuService.selectedComponentNode$.pipe(
                map((component) => component?.name || ''),
            ),
            openDocumentsService: this.openDocumentsService,
        })
        this.elementAtomMetadataIndex = new ElementAtomMetadataIndex(this)
        this.wordMetadataMapService = new WordMetadataMapService({
            visibleElementsService: this.visibleElementsService,
            aggregateElementIndexService: this.elementAtomMetadataIndex,
        })
        this.highlighterService = new HighlighterService({
            wordElementMap$: this.wordMetadataMapService
                .visibleWordMetadataMap$,
        })
        this.temporaryHighlightService = new TemporaryHighlightService({
            highlighterService: this.highlighterService,
            cardService: this.cardsRepository,
        })
        this.videoMetadataRepository = new VideoMetadataRepository()
        this.wordsService = new WordsService(this)
        this.notableSubsequencesService = new NotableSubsequencesService(this)
        this.libraryService = new LibraryService(this)
        this.documentCheckingOutService = new DocumentCheckingOutService(this)
        this.droppedFilesService = new DroppedFilesService()
        this.tabulationConfigurationService = new TabulationConfigurationService(
            this,
        )
        this.tabulationService = new TabulationService(this)

        this.openDocumentsService.openDocumentBodies$.subscribe((body) =>
            this.browserInputsService.applyDocumentListeners(
                body.ownerDocument as HTMLDocument,
            ),
        )
        this.uploadingDocumentsService = new UploadingDocumentsService(this)
        this.uploadingDocumentsService.uploadingMessages$.subscribe((msg) =>
            this.alertsService.info(msg),
        )
        this.translationAttemptRepository = new TranslationAttemptRepository(
            this,
        )
        this.weightedVocabService = new WeightedVocabService(this)
        this.translationAttemptScheduleService = new TranslationAttemptScheduleService(
            this,
        )
        this.translationAttemptService = new TranslationAttemptService(this)
        this.flashCardLearningTargetsService = new FlashCardLearningTargetsService(this)
        this.quizCardScheduleRowsService = new QuizCardScheduleRowsService(this)
        this.quizCardScheduleService = new ScheduleService({
            scheduleRowsService: this.quizCardScheduleRowsService,
            timeService: this.timeService,
        })
        this.sortedLimitedQuizScheduleRowsService = new SortedLimitScheduleRowsService(
            this,
        )
        this.exampleSentencesService = new ExampleSegmentsService(this)
        this.quizService = new QuizService(this)

        this.createdSentenceManager = new CreatedSentenceManager(this.databaseService)
        this.audioRecordingService = new AudioManager({
            audioSource,
            generalToastMessageService: this.generalToastMessageService,
        })
        this.micFeedbackService = new MicFeedbackService({
            audioSource,
        })
        this.isRecordingService = new IsRecordingService(this)
        this.speechPracticeService = new SpeechPracticeService({
            audioRecorder: this.audioRecordingService.audioRecorder,
            languageConfigsService: this.languageConfigsService,
        })
        this.quizResultService = new QuizResultService({
            wordRecognitionProgressRepository: this.wordRecognitionProgressRepository,
            scheduleRowsService: this.quizCardScheduleRowsService,
        })

        this.observableService.videoMetadata$.subscribe((metadata) => {
            this.pronunciationVideoService.videoMetadata$.next(metadata)
        })
        InputPage(this.browserInputsService, this.openDocumentsService)
        CardPage(this.cardsRepository, this.openDocumentsService)

        this.openDocumentsService.renderedSegments$.subscribe((segments) => {
            this.browserInputsService.applySegmentListeners(segments)
        })
        this.readingDocumentService = new ReadingDocumentService(this)

        this.highlighter = new Highlighter(this)


        this.browserInputsService.selectedText$.subscribe((word) => {
            this.audioRecordingService.audioRecorder.recordRequest$.next(
                new RecordRequest(word),
            )
            this.audioRecordingService.queSynthesizedSpeechRequest$.next(word)
        })

        /*
                combineLatest([
                    this.highlightAllWithDifficultySignal$,
                    this.quizCardScheduleRowsService.scheduleRows$,
                ]).subscribe(([signal, indexedScheduleRows]) => {
                    signal
                        ? this.highlighter.highlightWithDifficulty$.next(
                              indexedScheduleRows,
                          )
                        : this.highlighter.highlightWithDifficulty$.next({})
                })
        */

        this.goalsService = new GoalsService(this)

        this.audioRecordingService.audioRecorder.audioSource.errors$
            .pipe(AlertsService.pipeToColor('warning'))
            .subscribe((alert) => this.alertsService.newAlerts$.next(alert))

        const v = new HighlightPronunciationVideoService({
            pronunciationVideoService: this.pronunciationVideoService,
            highlighterService: this.highlighterService,
            wordMetadataMapService: this.wordMetadataMapService,
        })

        const LEARNING_GREEN: RGBA = [88, 204, 2, 0.5]
        this.audioRecordingService.audioRecorder.currentRecognizedText$.subscribe(
            (text) =>
                text &&
                this.temporaryHighlightService.highlightTemporaryWord(
                    removePunctuation(text),
                    LEARNING_GREEN,
                    5000,
                ),
        )

        this.editingVideoMetadataService = new EditingVideoMetadataService({
            pronunciationVideoService: this.pronunciationVideoService,
        })

        const pps = new HighlightPronunciationProgressService({
            pronunciationProgressService: this.pronunciationProgressService,
            highlighterService: this.highlighterService,
        })
        const hrds = new HighlightRecollectionDifficultyService({
            wordRecognitionRowService: this.wordRecognitionProgressRepository,
            highlighterService: this.highlighterService,
        });

        this.leaderBoardService = new LeaderBoardService(this)

        const ths = new TestHotkeysService(this)
        this.introSeriesService = new IntroSeriesService(this)
        this.introHighlightSeries = new IntroHighlightService({
            temporaryHighlightService: this.temporaryHighlightService,
            renderedSegments$: this.openDocumentsService.renderedSegments$,
        })
        this.introService = new IntroService({
            pronunciationVideoRef$: this.pronunciationVideoService.videoRef$,
            introSeriesService: new IntroSeriesService({
                settingsService: this.settingsService,
            }),
            currentVideoMetadata$: this.pronunciationVideoService
                .videoMetadata$,
        })
        this.documentCheckingOutService = new DocumentCheckingOutService({
            settingsService: this.settingsService,
        })
        this.documentSelectionService = new DocumentSelectionService({
            documentRepository: this.documentRepository,
            settingsService: this.settingsService,
        })
        this.requestRecordingService = new RequestRecordingService({
            readingDocumentService: this.readingDocumentService,
            loggedInUserService: this.loggedInUserService,
        })

        this.mousedOverWordHighlightService = new MousedOverWordHighlightService(
            this,
        )

        const aees = new AtomElementEventsService({
            openDocumentsService: this.openDocumentsService,
            modesService: this.modesService,
            highlighter: this.highlighter,
            pronunciationVideoService: this.pronunciationVideoService,
            browserInputs: this.browserInputsService,
            elementAtomMetadataIndex: this.elementAtomMetadataIndex,
            cardsRepository: this.cardsRepository,
            videoMetadataRepository: this.videoMetadataRepository,
            mousedOverWordHighlightService: this.mousedOverWordHighlightService,
        })

        const vhs = new VideoMetadataHighlight(this)

        this.frequencyDocumentsRepository = new FrequencyDocumentsRepository(this)
        this.vocabService = new VocabService()
        this.progressTreeService = new FrequencyTreeService(this)
        this.quizHighlightService = new QuizHighlightService(this)
        this.filterScheduleTableRowsService = new FilterScheduleTableRowsService(
            {
                scheduleService: this.sortedLimitedQuizScheduleRowsService,
                settingsService: this.settingsService,
            },
        )
        this.wordCardModalService = new WordCardModalService(this)
        this.loadingMessagesService = new LoadingMessagesService(this)
        this.advanceTimeService = new AdvanceTimeService(this)
        this.readingProgressService = new ReadingProgressService(this)
        this.csvService = new CsvService(this)

        this.hotkeyEvents.startListeners()
        this.cardsRepository.load()
    }
}
