import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {debounceTime, map, shareReplay, startWith, switchMap, tap} from "rxjs/operators";
import {DatabaseService} from "./Storage/database.service";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {AtomMetadata} from "./Interfaces/atom-metadata.interface.ts/atom-metadata";
import {AudioManager} from "./Manager/AudioManager";
import CardsRepository from "./Manager/cards.repository";
import {OpenDocumentsService} from "./Manager/open-documents.service";
import {QuizComponent, QuizManager} from "./Manager/QuizManager";
import {BrowserInputs} from "./Hotkeys/BrowserInputs";
import {resolveICardForWord} from "./Pipes/ResolveICardForWord";
import {CardScheduleQuiz} from "./Manager/ManagerConnections/Card-Schedule-Quiz";
import {InputPage} from "./Manager/ManagerConnections/Input-Page";
import {CardPage} from "./Manager/ManagerConnections/Card-Page";
import {InputQuiz} from "./Manager/ManagerConnections/Input-Quiz";
import {ScheduleQuiz} from "./Manager/ManagerConnections/Schedule-Quiz";
import {CreatedSentenceManager} from "./Manager/CreatedSentenceManager";
import {Segment} from "./Atomized/segment";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import EditingCardManager from "./Manager/EditingCardManager";
import {CardPageEditingCardCardDBAudio} from "./Manager/ManagerConnections/Card-Page-EditingCard-CardDB-Audio";
import {ProgressManager} from "./Manager/ProgressManager";
import {AppContext} from "./AppContext/AppContext";
import {RecordRequest} from "./Interfaces/RecordRequest";
import {resolveICardForWords} from "./Pipes/ResultICardForWords";
import {DocumentWordCount} from "./Interfaces/DocumentWordCount";
import {Highlighter} from "./Highlighting/Highlighter";
import {HotKeyEvents} from "./HotKeyEvents";
import {ModesService} from "./Modes/modes.service";
import {PronunciationVideoService} from "../components/PronunciationVideo/pronunciation-video.service";
import {ObservableService} from "../services/observable.service";
import {HighlighterService} from "./Highlighting/highlighter.service";
import {removePunctuation, TemporaryHighlightService} from "./Highlighting/temporary-highlight.service";
import {RGBA} from "./Highlighting/color.service";
import {EditingVideoMetadataService} from "../services/editing-video-metadata.service";
import {SettingsService} from "../services/settings.service";
import {HotkeysService} from "../services/hotkeys.service";
import {HighlightPronunciationVideoService} from "../services/highlight-pronunciation-video.service";
import {WordRecognitionProgressService} from "./schedule/word-recognition-progress.service";
import {PronunciationProgressService} from "./schedule/pronunciation-progress.service";
import {QuizResultService} from "./quiz/quiz-result.service";
import {HighlightPronunciationProgressService} from "./Highlighting/highlight-pronunciation-progress.service";
import {HighlightRecollectionDifficultyService} from "./Highlighting/highlight-recollection-difficulty.service";
import {TestHotkeysService} from "./Hotkeys/test-hotkeys.service";
import {CardCreationService} from "./card/card-creation.service";
import {IntroService} from "./intro/intro.service";
import {IntroSeriesService} from "./intro/intro-series.service";
import {IntroHighlightService} from "./intro/intro-highlight.service";
import {LoggedInUserService} from "./Auth/loggedInUserService";
import {DocumentCheckingOutService} from "../components/Library/document-checking-out.service";
import {DocumentRepository} from "./documents/document.repository";
import {LibraryService} from "./Manager/library.service";
import {DroppedFilesService} from "./uploading-documents/dropped-files.service";
import {UploadingDocumentsService} from "./uploading-documents/uploading-documents.service";
import {DocumentSelectionService} from "./document-selection/document-selection.service";
import {AlertsService} from "../services/alerts.service";
import {ReadingDocumentService} from "./Manager/reading-document.service";
import {RequestRecordingService} from "../components/PronunciationVideo/request-recording.service";
import {TreeMenuService} from "../services/tree-menu.service";
import {ScheduleService} from "./Manager/schedule.service";
import {QuizService} from "../components/quiz/quiz.service";
import {ExampleSegmentsService} from "./example-segments.service";
import {ImageSearchService} from "./image-search.service";
import {ScheduleRowsService} from "./Manager/schedule-rows.service";
import {GoalsService} from "./goals.service";
import {ActiveSentenceService} from "./active-sentence.service";
import {VisibleService} from "./Manager/visible.service";
import {TabulatedDocuments} from "./Atomized/tabulated-documents.interface";
import {ElementAtomMetadataIndex} from "../services/element-atom-metadata.index";
import {WordMetadataMapService} from "../services/word-metadata-map.service";
import {AtomElementEventsService} from "./atom-element-events.service";
import {TrieService} from "./Manager/trie.service";
import {ToastMessageService} from "./toast-message.service";
import {ProgressItemService} from "../components/progress-item.service";
import {IsRecordingService} from "./is-recording.service";
import {HistoryService} from "./history.service";
import {LanguageConfigsService} from "./language-configs.service";
import {SpeechPracticeService} from "./speech-practice.service";
import {MicFeedbackService} from "./mic-feedback.service";
import {ModalService} from "./modal.service";
import {VideoMetadataRepository} from "../services/video-metadata.repository";
import {VideoMetadataHighlight} from "./Highlighting/video-metadata.highlight";
import {MousedOverWordHighlightService} from "./Highlighting/moused-over-word-highlight.service";
import {NotableSubsequencesService} from "./notable-subsequences.service";

export type CardDB = IndexDBManager<ICard>;

/*
const addHighlightedPinyin = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addVideoIndex = debounce((obs$: Subject<number | undefined>, index: number | undefined) => obs$.next(index), 100)
*/

function splitTextDataStreams$(textData$: Observable<TabulatedDocuments>) {
    return {
        wordElementMap$: textData$.pipe(map(({wordElementsMap}) => wordElementsMap)),
        wordCounts$: textData$.pipe(map(({wordCounts}) => wordCounts)),
        documentWordCounts: textData$.pipe(map(({documentWordCounts}) => documentWordCounts)),
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
    public audioManager: AudioManager;
    public cardsRepository: CardsRepository;
    public openDocumentsService: OpenDocumentsService;
    public scheduleManager: ScheduleService;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public browserInputs: BrowserInputs;
    public editingCardManager: EditingCardManager;
    public progressManager: ProgressManager;
    public visibleElementsService: VisibleService;
    public authManager = new LoggedInUserService();
    public highlighter: Highlighter;
    public pronunciationProgressService: PronunciationProgressService;
    public wordRecognitionProgressService: WordRecognitionProgressService;
    public introService: IntroService;
    public alertsService = new AlertsService();
    public requestRecordingService: RequestRecordingService;
    public treeMenuService: TreeMenuService<any, { value: any }>
    public scheduleRowsService: ScheduleRowsService;

    public observableService = new ObservableService();

    public imageSearchService = new ImageSearchService();

    public progressItemsService = new ProgressItemService();

    readingWordElementMap!: Observable<Dictionary<AtomMetadata[]>>;
    setQuizWord$: Subject<string> = new Subject<string>();
    characterPageWordElementMap$ = new Subject<Dictionary<AtomMetadata[]>>();
    readingWordCounts$: Observable<Dictionary<DocumentWordCount[]>>;
    readingWordSentenceMap: Observable<Dictionary<Segment[]>>;
    highlightAllWithDifficultySignal$ = new BehaviorSubject<boolean>(true);
    library: LibraryService;
    modesService = new ModesService();
    pronunciationVideoService = new PronunciationVideoService();
    public editingVideoMetadataService: EditingVideoMetadataService;
    private highlighterService: HighlighterService;
    settingsService: SettingsService;
    hotkeysService: HotkeysService
    temporaryHighlightService: TemporaryHighlightService;
    private introSeriesService: IntroSeriesService;
    private introHighlightSeries: IntroHighlightService;
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
    private historyService: HistoryService;
    public languageConfigsService: LanguageConfigsService;
    public speechPracticeService: SpeechPracticeService;
    public micFeedbackService: MicFeedbackService;
    public modalService = new ModalService();
    public videoMetadataRepository: VideoMetadataRepository;
    public mousedOverWordHighlightService: MousedOverWordHighlightService;

    constructor(public db: DatabaseService, {audioSource}: AppContext) {
        this.toastMessageService = new ToastMessageService({
            alertsService: this.alertsService
        })
        this.historyService = new HistoryService()
        this.settingsService = new SettingsService({
            db,
            historyService: this.historyService
        });
        this.languageConfigsService = new LanguageConfigsService({
            settingsService: this.settingsService,
        });
        this.settingsService
            .spokenLanguage$
            .subscribe(audioSource.learningToKnownSpeech$);
        this.treeMenuService = new TreeMenuService<any, { value: any }>({
            settingsService: this.settingsService
        });
        this.hotkeysService = new HotkeysService({settingsService: this.settingsService})
        this.hotkeyEvents = new HotKeyEvents(this)
        this.activeSentenceService = new ActiveSentenceService({
            settingsService: this.settingsService,
            languageConfigsService: this.languageConfigsService
        })
        this.browserInputs = new BrowserInputs({
            hotkeys$: this.hotkeysService.mapHotkeysWithDefault(
                HotKeyEvents.defaultHotkeys(),
                this.hotkeyEvents.hotkeyActions(),
            ),
            activeSentenceService: this.activeSentenceService,
            settings$: this.settingsService,
        });
        this.documentRepository = new DocumentRepository({databaseService: this.db});
        this.cardsRepository = new CardsRepository({databaseService: db});
        this.library = new LibraryService({
            db,
            settingsService: this.settingsService,
            documentRepository: this.documentRepository,
        });
        this.documentCheckingOutService = new DocumentCheckingOutService({settingsService: this.settingsService})
        this.droppedFilesService = new DroppedFilesService();
        this.pronunciationProgressService = new PronunciationProgressService({db});
        this.wordRecognitionProgressService = new WordRecognitionProgressService({db});
        this.trieService = new TrieService({
            cardsService: this.cardsRepository,
            pronunciationProgressService: this.pronunciationProgressService,
            wordRecognitionProgressService: this.wordRecognitionProgressService
        })
        this.openDocumentsService = new OpenDocumentsService({
            trie$: this.trieService.trie$,
            db,
            settingsService: this.settingsService,
            documentRepository: this.documentRepository
        });

        this.openDocumentsService.openDocumentBodies$.subscribe(body => this.browserInputs.applyDocumentListeners(body.ownerDocument as HTMLDocument))
        this.uploadingDocumentsService = new UploadingDocumentsService({
            progressItemService: this.progressItemsService,
            documentCheckingOutService: this.documentCheckingOutService,
            droppedFilesService: this.droppedFilesService,
            libraryService: this.library
        });
        this.uploadingDocumentsService.uploadingMessages$.subscribe(msg => this.alertsService.info(msg));
        /*
         * wordElementsMap: Dictionary<IAnnotatedCharacter[]>;
         * wordCounts: Dictionary<number>;
         * wordSentenceMap: Dictionary<AtomizedSentence[]>;
         * sentenceMap: Dictionary<AtomizedSentence[]>;
         */
        const {wordElementMap$, sentenceMap$, documentWordCounts} = splitTextDataStreams$(
            this.openDocumentsService.displayDocumentTabulation$
        );
        this.readingWordElementMap = wordElementMap$;
        this.readingWordCounts$ = documentWordCounts;
        this.readingWordSentenceMap = sentenceMap$;
        this.scheduleRowsService = new ScheduleRowsService({
            wordCounts$: this.readingWordCounts$,
            recognitionRecordsService: this.wordRecognitionProgressService,
            pronunciationRecordsService: this.pronunciationProgressService,
            cardsRepository: this.cardsRepository
        });
        this.scheduleManager = new ScheduleService({
                db,
                settingsService: this.settingsService,
                scheduleRowsService: this.scheduleRowsService
            }
        );

        this.videoMetadataRepository = new VideoMetadataRepository({
            cardsRepository: this.cardsRepository
        });

        this.exampleSentencesService = new ExampleSegmentsService({
            openDocumentsService: this.openDocumentsService,
        })
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioManager = new AudioManager(audioSource);
        this.micFeedbackService = new MicFeedbackService({
            audioSource
        });
        this.isRecordingService = new IsRecordingService({
            settingsService: this.settingsService,
            audioRecordingService: this.audioManager
        })
        this.speechPracticeService = new SpeechPracticeService({
            audioRecorder: this.audioManager.audioRecorder,
            languageConfigsService: this.languageConfigsService
        });
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager({
            wordRecognitionRows$: this.wordRecognitionProgressService.records$,
            scheduleRows$: this.scheduleRowsService.indexedScheduleRows$
        });
        this.quizManager = new QuizManager({
                scheduledCards$: this.scheduleManager.wordQuizList$.pipe(
                    map(rows => rows.map(row => row.word)),
                    resolveICardForWords(this.cardsRepository.cardIndex$)
                ),
                requestHighlightedWord: s => {
                }
            },
        );

        new QuizResultService({
            srmService: this.scheduleManager.srmService,
            quizManager: this.quizManager,
            wordRecognitionProgressService: this.wordRecognitionProgressService,
            scheduleRowsService: this.scheduleRowsService
        })


        combineLatest([
            this.scheduleRowsService.indexedScheduleRows$,
            this.quizManager.quizzingCard$
        ]).pipe(debounceTime(0)).subscribe(([indexedScheduleRows, quizzingCard]) => {
            if (quizzingCard && !indexedScheduleRows[quizzingCard.learningLanguage]) {
                this.quizManager.requestNextCard$.next();
            }
        });

        this.observableService.videoMetadata$
            .subscribe(metadata => {
                this.pronunciationVideoService.videoMetadata$.next(metadata);
            })
        // const normalizeSentenceRegexp = /[\u4E00-\uFA29]/;

        CardScheduleQuiz(this.cardsRepository, this.scheduleManager, this.quizManager);
        InputPage(this.browserInputs, this.openDocumentsService);
        CardPage(this.cardsRepository, this.openDocumentsService);
        InputQuiz(this.browserInputs, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardsRepository, this.openDocumentsService, this.editingCardManager, this.cardDBManager, this.audioManager)

        this.openDocumentsService.renderedSegments$.subscribe(segments => {
                this.browserInputs.applySegmentListeners(segments)
            }
        );
        this.readingDocumentService = new ReadingDocumentService({
            trie$: this.trieService.trie$,
            openDocumentsService: this.openDocumentsService,
            settingsService: this.settingsService
        });
        // this.visibleSentencesService = new VisibleSentencesService({readingDocumentService: this.readingDocumentService})
        this.quizService = new QuizService({
            scheduleService: this.scheduleManager,
            exampleSentencesService: this.exampleSentencesService,
            trie$: this.trieService.trie$,
            cardService: this.cardsRepository,
            openDocumentsService: this.openDocumentsService
        })
        this.visibleElementsService = new VisibleService({
            componentInView$: this.treeMenuService.selectedComponentNode$.pipe(
                map(component => component?.name || '')
            ),
            openDocumentsService: this.openDocumentsService,
            quizService: this.quizService
        });
        this.elementAtomMetadataIndex = new ElementAtomMetadataIndex({
            openDocumentsService: this.openDocumentsService,
            visibleElementsService: this.visibleElementsService
        })
        this.wordMetadataMapService = new WordMetadataMapService({
            visibleElementsService: this.visibleElementsService,
            aggregateElementIndexService: this.elementAtomMetadataIndex
        });
        this.highlighterService = new HighlighterService(
            {
                wordElementMap$: this.wordMetadataMapService.visibleWordMetadataMap$
            }
        )

        this.highlighter = new Highlighter({
            highlighterService: this.highlighterService,
            quizService: this.quizService
        })

        this.readingWordElementMap = combineLatest([
            this.readingWordElementMap.pipe(
                startWith({})
            ),
            this.characterPageWordElementMap$.pipe(startWith({}))
        ]).pipe(map((wordElementMaps: Dictionary<AtomMetadata[]>[]) => {
            return mergeDictArrays<AtomMetadata>(...wordElementMaps);
        }));


        this.setQuizWord$.pipe(
            resolveICardForWord<string, ICard>(this.cardsRepository.cardIndex$)
        ).subscribe((icard) => {
            this.quizManager.setQuizCard(icard);
        })

        this.hotkeyEvents.hide$.subscribe(() => {
            this.editingCardManager.showEditingCardPopup$.next(false)
        });

        /*
                merge(
                    this.inputManager.getKeyDownSubject("d").pipe(filterTextInputEvents),
                ).subscribe(() => this.highlightAllWithDifficultySignal$.next(!this.highlightAllWithDifficultySignal$.getValue()))
        */

        this.browserInputs.selectedText$.subscribe(word => {
            this.audioManager.audioRecorder.recordRequest$.next(new RecordRequest(word));
            this.audioManager.queSynthesizedSpeechRequest$.next(word);
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

        this.goalsService = new GoalsService({
            settingsService: this.settingsService,
            recognitionRecordsService: this.wordRecognitionProgressService,
            pronunciationRecordsService: this.pronunciationProgressService
        })


        this.audioManager.audioRecorder.audioSource
            .errors$.pipe(AlertsService.pipeToColor('warning'))
            .subscribe(alert => this.alertsService.newAlerts$.next(alert))


        this.quizManager.quizStage$.subscribe(stage => {
            switch (stage) {
                case QuizComponent.Characters:
                    this.editingCardManager.showEditingCardPopup$.next(false)
                    break;
                case QuizComponent.Conclusion:
                    this.editingCardManager.showEditingCardPopup$.next(true)
                    break;
            }
        })

        new HighlightPronunciationVideoService({
            pronunciationVideoService: this.pronunciationVideoService,
            highlighterService: this.highlighterService,
            wordMetadataMapService: this.wordMetadataMapService
        })

        this.temporaryHighlightService = new TemporaryHighlightService({
            highlighterService: this.highlighterService,
            cardService: this.cardsRepository
        });
        const LEARNING_GREEN: RGBA = [88, 204, 2, 0.5];
        this.audioManager.audioRecorder.currentRecognizedText$
            .subscribe(text => text && this.temporaryHighlightService.highlightTemporaryWord(removePunctuation(text), LEARNING_GREEN, 5000))

        this.editingVideoMetadataService = new EditingVideoMetadataService({
            pronunciationVideoService: this.pronunciationVideoService
        })

        new HighlightPronunciationProgressService({
            pronunciationProgressService: this.pronunciationProgressService,
            highlighterService: this.highlighterService
        });
        new HighlightRecollectionDifficultyService({
            wordRecognitionRowService: this.wordRecognitionProgressService,
            highlighterService: this.highlighterService
        });

        new TestHotkeysService({
            hotkeyEvents: this.hotkeyEvents,
            pronunciationProgressService: this.pronunciationProgressService
        });

        new CardCreationService({
            cardService: this.cardsRepository,
            pronunciationProgressService: this.pronunciationProgressService,
            wordRecognitionService: this.wordRecognitionProgressService
        })
        this.introSeriesService = new IntroSeriesService({
            settingsService: this.settingsService
        });
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

        this.mousedOverWordHighlightService = new MousedOverWordHighlightService({
            highlighterService: this.highlighterService
        })

        new AtomElementEventsService({
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

        new VideoMetadataHighlight({
            highlighterService: this.highlighterService,
            videoMetadataRepository: this.videoMetadataRepository,
            modesService: this.modesService
        });

        new NotableSubsequencesService({
            cardsRepository: this.cardsRepository,
            openDocumentsService: this.openDocumentsService
        })


        this.hotkeyEvents.startListeners();
        this.cardsRepository.load();
    }
}



