import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {debounceTime, map, shareReplay, startWith, switchMap, tap} from "rxjs/operators";
import {DatabaseService} from "./Storage/database.service";
import React from "react";
import {ICard} from "../../../server/src/shared/ICard";
import {IndexDBManager} from "./Storage/indexed-db";
import {AtomMetadata} from "../../../server/src/shared/atom-metadata.interface.ts/atom-metadata";
import {AudioManager} from "./manager/AudioManager";
import CardsRepository from "./manager/cards.repository";
import {OpenDocumentsService} from "./manager/open-documents.service";
import {QuizManager} from "./manager/QuizManager";
import {BrowserInputs} from "./hotkeys/browser-inputs";
import {resolveICardForWord} from "./pipes/ResolveICardForWord";
import {CardScheduleQuiz} from "./manager/manager-connections/Card-Schedule-Quiz";
import {InputPage} from "./manager/manager-connections/Input-Page";
import {CardPage} from "./manager/manager-connections/Card-Page";
import {InputQuiz} from "./manager/manager-connections/Input-Quiz";
import {ScheduleQuiz} from "./manager/manager-connections/Schedule-Quiz";
import {CreatedSentenceManager} from "./manager/CreatedSentenceManager";
import {Segment} from "@shared/";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import EditingCardManager from "./manager/EditingCardManager";
import {CardPageEditingCardCardDBAudio} from "./manager/manager-connections/Card-Page-EditingCard-CardDB-Audio";
import {ProgressManager} from "./manager/ProgressManager";
import {AppContext} from "./app-context/AppContext";
import {RecordRequest} from "./Util/RecordRequest";
import {resolveICardForWords} from "./pipes/ResultICardForWords";
import {DocumentWordCount} from "../../../server/src/shared/DocumentWordCount";
import {Highlighter} from "./highlighting/Highlighter";
import {HotKeyEvents} from "./HotKeyEvents";
import {ModesService} from "./modes/modes.service";
import {PronunciationVideoService} from "../components/pronunciation-video/pronunciation-video.service";
import {ObservableService} from "../services/observable.service";
import {HighlighterService} from "./highlighting/highlighter.service";
import {removePunctuation, TemporaryHighlightService} from "./highlighting/temporary-highlight.service";
import {RGBA} from "./highlighting/color.service";
import {EditingVideoMetadataService} from "../services/editing-video-metadata.service";
import {SettingsService} from "../services/settings.service";
import {HotkeysService} from "../services/hotkeys.service";
import {HighlightPronunciationVideoService} from "../services/highlight-pronunciation-video.service";
import {WordRecognitionProgressRepository} from "./schedule/word-recognition-progress.repository";
import {PronunciationProgressRepository} from "./schedule/pronunciation-progress.repository";
import {QuizResultService} from "./quiz/quiz-result.service";
import {HighlightPronunciationProgressService} from "./highlighting/highlight-pronunciation-progress.service";
import {HighlightRecollectionDifficultyService} from "./highlighting/highlight-recollection-difficulty.service";
import {TestHotkeysService} from "./hotkeys/test-hotkeys.service";
import {CardCreationService} from "./card/card-creation.service";
import {IntroService} from "./intro/intro.service";
import {IntroSeriesService} from "./intro/intro-series.service";
import {IntroHighlightService} from "./intro/intro-highlight.service";
import {LoggedInUserService} from "./auth/loggedInUserService";
import {DocumentCheckingOutService} from "../components/library/document-checking-out.service";
import {DocumentRepository} from "./documents/document.repository";
import {LibraryService} from "./manager/library.service";
import {DroppedFilesService} from "./uploading-documents/dropped-files.service";
import {UploadingDocumentsService} from "./uploading-documents/uploading-documents.service";
import {DocumentSelectionService} from "./document-selection/document-selection.service";
import {AlertsService} from "../services/alerts.service";
import {ReadingDocumentService} from "./manager/reading-document.service";
import {RequestRecordingService} from "../components/pronunciation-video/request-recording.service";
import {TreeMenuService} from "../services/tree-menu.service";
import {ScheduleService} from "./manager/schedule.service";
import {QuizService} from "../components/quiz/quiz.service";
import {ExampleSegmentsService} from "./example-segments.service";
import {ImageSearchService} from "./image-search.service";
import {ScheduleRowsService} from "./manager/schedule-rows.service";
import {GoalsService} from "./goals.service";
import {ActiveSentenceService} from "./active-sentence.service";
import {VisibleService} from "./manager/visible.service";
import {TabulatedDocuments} from "@shared/";
import {ElementAtomMetadataIndex} from "../services/element-atom-metadata.index";
import {WordMetadataMapService} from "../services/word-metadata-map.service";
import {AtomElementEventsService} from "./atom-element-events.service";
import {TrieService} from "./manager/trie.service";
import {ToastMessageService} from "./toast-message.service";
import {ProgressItemService} from "../components/progress-item.service";
import {IsRecordingService} from "./is-recording.service";
import {HistoryService} from "./history.service";
import {LanguageConfigsService} from "./language-configs.service";
import {SpeechPracticeService} from "./speech-practice.service";
import {MicFeedbackService} from "./mic-feedback.service";
import {ModalService} from "./modal.service";
import {VideoMetadataRepository} from "../services/video-metadata.repository";
import {VideoMetadataHighlight} from "./highlighting/video-metadata.highlight";
import {MousedOverWordHighlightService} from "./highlighting/moused-over-word-highlight.service";
import {IgnoredWordsRepository} from "./schedule/ignored-words.repository";
import {FrequencyDocumentsRepository} from "./frequency-documents.repository";
import {AllWordsRepository} from "./all-words.repository";
import {QuizHighlightService} from "./highlighting/quiz-highlight.service";
import {FrequencyTreeService} from "./frequency-tree.service";
import {VocabService} from "./vocab.service";
import {FilterScheduleTableRowsService} from "./filter-schedule-table-rows.service";
import {SortedLimitScheduleRowsService} from "./manager/sorted-limit-schedule-rows.service";
import {WordCardModalService} from "./word-card-modal.service";

export type CardDB = IndexDBManager<ICard>;

/*
const addHighlightedPinyin = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addVideoIndex = debounce((obs$: Subject<number | undefined>, index: number | undefined) => obs$.next(index), 100)
*/

function splitTextDataStreams$(textData$: Observable<TabulatedDocuments>) {
    return {
        wordElementMap$: textData$.pipe(map(({wordElementsMap}) => wordElementsMap)),
        wordCounts$: textData$.pipe(map(({wordCounts}) => wordCounts)),
        documentwordCounts: textData$.pipe(map(({documentWordCounts}) => documentWordCounts)),
        wordSentenceMap: textData$.pipe(map(({wordSegmentMap}) => wordSegmentMap)),
        sentenceMap$: textData$.pipe(map(({wordSegmentMap}) => wordSegmentMap))
    }
}

export class Manager {
    public cardDBManager = new IndexDBManager<ICard>(
        this.db,
        this.db.cards,
        (c: ICard) => c.id,
        (i: number, c: ICard) => ({...c, id: i})
    );
    public hotkeyEvents: HotKeyEvents;
    public audioRecordingService: AudioManager;
    public cardsRepository: CardsRepository;
    public openDocumentsService: OpenDocumentsService;
    public scheduleService: ScheduleService;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public browserInputs: BrowserInputs;
    public editingCardManager: EditingCardManager;
    public progressManager: ProgressManager;
    public visibleElementsService: VisibleService;
    public authManager = new LoggedInUserService();
    public highlighter: Highlighter;
    public pronunciationProgressService: PronunciationProgressRepository;
    public wordRecognitionProgressService: WordRecognitionProgressRepository;
    public introService: IntroService;
    public alertsService = new AlertsService();
    public requestRecordingService: RequestRecordingService;
    public treeMenuService: TreeMenuService<any, { value: any }>
    public scheduleRowsService: ScheduleRowsService;

    public observableService = new ObservableService();

    public imageSearchService = new ImageSearchService();

    public progressItemService = new ProgressItemService();

    readingwordElementMap!: Observable<Dictionary<AtomMetadata[]>>;
    characterPagewordElementMap$ = new Subject<Dictionary<AtomMetadata[]>>();
    readingWordCounts$: Observable<Dictionary<DocumentWordCount[]>>;
    readingwordSentenceMap: Observable<Dictionary<Segment[]>>;
    highlightAllWithDifficultySignal$ = new BehaviorSubject<boolean>(true);
    libraryService: LibraryService;
    modesService = new ModesService();
    pronunciationVideoService = new PronunciationVideoService();
    public editingVideoMetadataService: EditingVideoMetadataService;
    public highlighterService: HighlighterService;
    settingsService: SettingsService;
    hotkeysService: HotkeysService
    temporaryHighlightService: TemporaryHighlightService;
    public introSeriesService: IntroSeriesService;
    public introHighlightSeries: IntroHighlightService;
    droppedFilesService: DroppedFilesService;
    documentCheckingOutService: DocumentCheckingOutService;
    documentRepository: DocumentRepository;
    uploadingDocumentsService: UploadingDocumentsService;
    documentSelectionService: DocumentSelectionService;
    readingDocumentService: ReadingDocumentService;
    exampleSentencesService: ExampleSegmentsService;
    public quizService: QuizService;
    public goalsService: GoalsService;
    public activeSentenceService: ActiveSentenceService;
    public elementAtomMetadataIndex: ElementAtomMetadataIndex;
    public wordMetadataMapService: WordMetadataMapService;
    public trieService: TrieService;
    public toastMessageService: ToastMessageService;
    public isRecordingService: IsRecordingService;
    public historyService: HistoryService;
    public languageConfigsService: LanguageConfigsService;
    public speechPracticeService: SpeechPracticeService;
    public micFeedbackService: MicFeedbackService;
    public modalService = new ModalService();
    public videoMetadataRepository: VideoMetadataRepository;
    public mousedOverWordHighlightService: MousedOverWordHighlightService;
    public ignoredWordsRepository: IgnoredWordsRepository;
    public frequencyDocumentsRepository: FrequencyDocumentsRepository;
    public allWordsRepository: AllWordsRepository;
    public progressTreeService: FrequencyTreeService;
    public quizHighlightService: QuizHighlightService;
    public vocabService: VocabService;
    public filterScheduleTableRowsService: FilterScheduleTableRowsService;
    sortedLimitScheduleRowsService: SortedLimitScheduleRowsService;
    wordCardModalService: WordCardModalService;

    constructor(public db: DatabaseService, {audioSource}: AppContext) {
        this.ignoredWordsRepository = new IgnoredWordsRepository(this);
        this.allWordsRepository = new AllWordsRepository();
        this.toastMessageService = new ToastMessageService(this)
        this.historyService = new HistoryService()
        this.settingsService = new SettingsService(this);
        this.languageConfigsService = new LanguageConfigsService(this);
        this.settingsService
            .spokenLanguage$
            .subscribe(audioSource.learningToKnownSpeech$);
        this.treeMenuService = new TreeMenuService<any, { value: any }>(this);
        this.hotkeysService = new HotkeysService(this)
        this.hotkeyEvents = new HotKeyEvents(this)
        this.activeSentenceService = new ActiveSentenceService(this)
        this.browserInputs = new BrowserInputs({
            hotkeys$: this.hotkeysService.mapHotkeysWithDefault(
                HotKeyEvents.defaultHotkeys(),
                this.hotkeyEvents.hotkeyActions(),
            ),
            activeSentenceService: this.activeSentenceService,
            settingsService: this.settingsService,
            languageConfigsService: this.languageConfigsService
        });
        this.documentRepository = new DocumentRepository({databaseService: this.db});
        this.cardsRepository = new CardsRepository({databaseService: db});
        this.libraryService = new LibraryService(this);
        this.documentCheckingOutService = new DocumentCheckingOutService(this)
        this.droppedFilesService = new DroppedFilesService();
        this.pronunciationProgressService = new PronunciationProgressRepository(this);
        this.wordRecognitionProgressService = new WordRecognitionProgressRepository(this);
        this.trieService = new TrieService(this)
        this.openDocumentsService = new OpenDocumentsService({
            trie$: this.trieService.trie$,
            db,
            settingsService: this.settingsService,
            documentRepository: this.documentRepository,
            languageConfigsService: this.languageConfigsService
        });

        this.openDocumentsService.openDocumentBodies$.subscribe(body => this.browserInputs.applyDocumentListeners(body.ownerDocument as HTMLDocument))
        this.uploadingDocumentsService = new UploadingDocumentsService(this);
        this.uploadingDocumentsService.uploadingMessages$.subscribe(msg => this.alertsService.info(msg));
        /*
         * wordElementsMap: Dictionary<IAnnotatedCharacter[]>;
         * wordCounts: Dictionary<number>;
         * wordSentenceMap: Dictionary<AtomizedSentence[]>;
         * sentenceMap: Dictionary<AtomizedSentence[]>;
         */
        const {wordElementMap$, sentenceMap$, documentwordCounts} = splitTextDataStreams$(
            this.openDocumentsService.displayDocumentTabulation$
        );
        this.readingwordElementMap = wordElementMap$;
        this.readingWordCounts$ = documentwordCounts;
        this.readingwordSentenceMap = sentenceMap$;
        this.scheduleRowsService = new ScheduleRowsService(this);
        this.scheduleService = new ScheduleService(this);

        this.videoMetadataRepository = new VideoMetadataRepository(this);

        this.exampleSentencesService = new ExampleSegmentsService(this)
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioRecordingService = new AudioManager(audioSource);
        this.micFeedbackService = new MicFeedbackService({
            audioSource
        });
        this.isRecordingService = new IsRecordingService(this)
        this.speechPracticeService = new SpeechPracticeService({
            audioRecorder: this.audioRecordingService.audioRecorder,
            languageConfigsService: this.languageConfigsService
        });
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager({
            wordRecognitionRows$: this.wordRecognitionProgressService.records$,
            scheduleRows$: this.scheduleRowsService.indexedScheduleRows$
        });
        this.quizManager = new QuizManager();

        const s = new QuizResultService({
            srmService: this.scheduleService.srmService,
            quizManager: this.quizManager,
            wordRecognitionProgressService: this.wordRecognitionProgressService,
            scheduleRowsService: this.scheduleRowsService,
            alertsService: this.alertsService
        })

        this.observableService.videoMetadata$
            .subscribe(metadata => {
                this.pronunciationVideoService.videoMetadata$.next(metadata);
            })
        // const normalizeSentenceRegexp = /[\u4E00-\uFA29]/;

        CardScheduleQuiz(this.cardsRepository, this.scheduleService, this.quizManager);
        InputPage(this.browserInputs, this.openDocumentsService);
        CardPage(this.cardsRepository, this.openDocumentsService);
        InputQuiz(this.browserInputs, this.quizManager)
        ScheduleQuiz(this.scheduleService, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardsRepository, this.openDocumentsService, this.editingCardManager, this.cardDBManager, this.audioRecordingService)

        this.openDocumentsService.renderedSegments$.subscribe(segments => {
                this.browserInputs.applySegmentListeners(segments)
            }
        );
        this.readingDocumentService = new ReadingDocumentService({
            trie$: this.trieService.trie$,
            openDocumentsService: this.openDocumentsService,
            settingsService: this.settingsService,
            languageConfigsService: this.languageConfigsService
        });
        this.sortedLimitScheduleRowsService = new SortedLimitScheduleRowsService(this)
        this.quizService = new QuizService({
            sortedLimitScheduleRowsService: this.sortedLimitScheduleRowsService,
            exampleSentencesService: this.exampleSentencesService,
            trie$: this.trieService.trie$,
            cardService: this.cardsRepository,
            openDocumentsService: this.openDocumentsService,
            languageConfigsService: this.languageConfigsService,
            settingsService: this.settingsService
        })
        this.visibleElementsService = new VisibleService({
            componentInView$: this.treeMenuService.selectedComponentNode$.pipe(
                map(component => component?.name || '')
            ),
            openDocumentsService: this.openDocumentsService,
            quizService: this.quizService
        });
        this.elementAtomMetadataIndex = new ElementAtomMetadataIndex(this)
        this.wordMetadataMapService = new WordMetadataMapService({
            visibleElementsService: this.visibleElementsService,
            aggregateElementIndexService: this.elementAtomMetadataIndex
        });
        this.highlighterService = new HighlighterService(
            {
                wordElementMap$: this.wordMetadataMapService.visibleWordMetadataMap$
            }
        )

        this.highlighter = new Highlighter(this)

        this.readingwordElementMap = combineLatest([
            this.readingwordElementMap.pipe(
                startWith({})
            ),
            this.characterPagewordElementMap$.pipe(startWith({}))
        ]).pipe(map((wordElementMaps: Dictionary<AtomMetadata[]>[]) => {
            return mergeDictArrays<AtomMetadata>(...wordElementMaps);
        }));


        this.hotkeyEvents.hide$.subscribe(() => {
            this.editingCardManager.showEditingCardPopup$.next(false)
        });

        /*
                merge(
                    this.inputManager.getKeyDownSubject("d").pipe(filterTextInputEvents),
                ).subscribe(() => this.highlightAllWithDifficultySignal$.next(!this.highlightAllWithDifficultySignal$.getValue()))
        */

        this.browserInputs.selectedText$.subscribe(word => {
            this.audioRecordingService.audioRecorder.recordRequest$.next(new RecordRequest(word));
            this.audioRecordingService.queSynthesizedSpeechRequest$.next(word);
            this.editingCardManager.requestEditWord$.next(word);
        });

        combineLatest([
            this.highlightAllWithDifficultySignal$,
            this.scheduleRowsService.indexedScheduleRows$,
        ]).subscribe(([signal, indexedScheduleRows]) => {
            signal ?
                this.highlighter.highlightWithDifficulty$.next(indexedScheduleRows) :
                this.highlighter.highlightWithDifficulty$.next({})
        });

        this.goalsService = new GoalsService(this)

        this.audioRecordingService.audioRecorder.audioSource
            .errors$.pipe(AlertsService.pipeToColor('warning'))
            .subscribe(alert => this.alertsService.newAlerts$.next(alert))


        const v = new HighlightPronunciationVideoService({
            pronunciationVideoService: this.pronunciationVideoService,
            highlighterService: this.highlighterService,
            wordMetadataMapService: this.wordMetadataMapService
        })

        this.temporaryHighlightService = new TemporaryHighlightService({
            highlighterService: this.highlighterService,
            cardService: this.cardsRepository
        });
        const LEARNING_GREEN: RGBA = [88, 204, 2, 0.5];
        this.audioRecordingService.audioRecorder.currentRecognizedText$
            .subscribe(text => text && this.temporaryHighlightService.highlightTemporaryWord(removePunctuation(text), LEARNING_GREEN, 5000))

        this.editingVideoMetadataService = new EditingVideoMetadataService({
            pronunciationVideoService: this.pronunciationVideoService
        })

        const pps = new HighlightPronunciationProgressService({
            pronunciationProgressService: this.pronunciationProgressService,
            highlighterService: this.highlighterService
        });
        const hrds = new HighlightRecollectionDifficultyService({
            wordRecognitionRowService: this.wordRecognitionProgressService,
            highlighterService: this.highlighterService
        });

        const ths = new TestHotkeysService(this);
        const ccs = new CardCreationService(this)
        this.introSeriesService = new IntroSeriesService(this);
        this.introHighlightSeries = new IntroHighlightService({
            temporaryHighlightService: this.temporaryHighlightService,
            renderedSegments$: this.openDocumentsService.renderedSegments$
        });
        this.introService = new IntroService({
            pronunciationVideoRef$: this.pronunciationVideoService.videoRef$,
            introSeriesService: new IntroSeriesService({settingsService: this.settingsService}),
            currentVideoMetadata$: this.pronunciationVideoService.videoMetadata$
        });
        this.documentCheckingOutService = new DocumentCheckingOutService({
            settingsService: this.settingsService
        })
        this.documentSelectionService = new DocumentSelectionService({
            documentRepository: this.documentRepository,
            settingsService: this.settingsService
        });
        this.requestRecordingService = new RequestRecordingService({
            readingDocumentService: this.readingDocumentService,
            loggedInUserService: this.authManager
        });

        this.mousedOverWordHighlightService = new MousedOverWordHighlightService(this)

        const aees = new AtomElementEventsService({
            openDocumentsService: this.openDocumentsService,
            modesService: this.modesService,
            highlighter: this.highlighter,
            pronunciationVideoService: this.pronunciationVideoService,
            browserInputs: this.browserInputs,
            elementAtomMetadataIndex: this.elementAtomMetadataIndex,
            cardsRepository: this.cardsRepository,
            videoMetadataRepository: this.videoMetadataRepository,
            mousedOverWordHighlightService: this.mousedOverWordHighlightService
        });

        const vhs = new VideoMetadataHighlight({
            highlighterService: this.highlighterService,
            videoMetadataRepository: this.videoMetadataRepository,
            modesService: this.modesService
        });


        this.frequencyDocumentsRepository = new FrequencyDocumentsRepository(this);
        this.vocabService = new VocabService(this)
        this.progressTreeService = new FrequencyTreeService(this);
        this.quizHighlightService = new QuizHighlightService( this )
        this.filterScheduleTableRowsService = new FilterScheduleTableRowsService(this);
        this.wordCardModalService = new WordCardModalService(this)

        this.hotkeyEvents.startListeners();
        this.cardsRepository.load();
    }
}



