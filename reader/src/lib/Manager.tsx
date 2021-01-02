import {BehaviorSubject, combineLatest, merge, Observable, of, ReplaySubject, Subject} from "rxjs";
import {debounce, Dictionary} from "lodash";
import {debounceTime, map, shareReplay, startWith, switchMap} from "rxjs/operators";
import {DatabaseService} from "./Storage/database.service";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {AtomMetadata} from "./Interfaces/atom-metadata.interface.ts/atom-metadata";
import {AudioManager} from "./Manager/AudioManager";
import CardService from "./Manager/CardService";
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
import {mergeTabulations} from "./Atomized/merge-tabulations";
import {Segment} from "./Atomized/segment";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import EditingCardManager from "./Manager/EditingCardManager";
import {CardPageEditingCardCardDBAudio} from "./Manager/ManagerConnections/Card-Page-EditingCard-CardDB-Audio";
import {ProgressManager} from "./Manager/ProgressManager";
import {AppContext} from "./AppContext/AppContext";
import {QuizCharacter} from "./Manager/QuizCharacter";
import {RecordRequest} from "./Interfaces/RecordRequest";
import {resolveICardForWords} from "./Pipes/ResultICardForWords";
import {DocumentWordCount} from "./Interfaces/DocumentWordCount";
import {Highlighter} from "./Highlighting/Highlighter";
import {HotKeyEvents} from "./HotKeyEvents";
import {ModesService} from "./Modes/modes.service";
import {PronunciationVideoService} from "../components/PronunciationVideo/pronunciation-video.service";
import {VideoMetadataService} from "../services/video-metadata.service";
import {SentenceVideoHighlightService} from "../services/sentence-video-highlight.service";
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
import {AvailableDocumentsService} from "./documents/available-documents.service";
import {DocumentSelectionService} from "./document-selection/document-selection.service";
import {AlertsService} from "../services/alerts.service";
import {ReadingDocumentService} from "./Manager/reading-document.service";
import {RequestRecordingService} from "../components/PronunciationVideo/request-recording.service";
import {TreeMenuService} from "../services/tree-menu.service";
import {ScheduleService} from "./Manager/schedule.service";
import {QuizService} from "../components/quiz/quiz.service";
import {ExampleSentencesService} from "./example-sentences.service";
import {ImageSearchService} from "./image-search.service";
import {ScheduleRowsService} from "./Manager/schedule-rows.service";
import {GoalsService} from "./goals.service";
import {ActiveSentenceService} from "./active-sentence.service";
import {documentElements, VisibleElementsService} from "./Manager/visible-elements.service";
import {TabulatedDocuments} from "./Atomized/tabulated-documents.interface";
import {flattenTree} from "./Tree/DeltaScanner";
import {AggregateElementIndexService} from "../services/aggregate-element-index.service";
import {XMLDocumentNode} from "./Interfaces/XMLDocumentNode";
import {safePush, safePushSet} from "../services/safe-push";
import {mapMap} from "./map.module";
import {WordMetadataMapService} from "../services/word-metadata-map.service";
import {AtomElementEventsService} from "./atom-element-events.service";

export type CardDB = IndexDBManager<ICard>;

const addHighlightedPinyin = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addVideoIndex = debounce((obs$: Subject<number | undefined>, index: number | undefined) => obs$.next(index), 100)

function splitTextDataStreams$(textData$: Observable<TabulatedDocuments>) {
    return {
        wordElementMap$: textData$.pipe(map(({wordElementsMap}) => wordElementsMap)),
        wordCounts$: textData$.pipe(map(({wordCounts}) => wordCounts)),
        documentWordCounts: textData$.pipe(map(({documentWordCounts}) => documentWordCounts)),
        wordSentenceMap: textData$.pipe(map(({wordSentenceMap}) => wordSentenceMap)),
        sentenceMap$: textData$.pipe(map(({wordSentenceMap}) => wordSentenceMap))
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
    public cardService: CardService;
    public openDocumentsService: OpenDocumentsService;
    public scheduleManager: ScheduleService;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public browserInputs: BrowserInputs;
    public editingCardManager: EditingCardManager;
    public progressManager: ProgressManager;
    public visibleElementsService: VisibleElementsService;
    public quizCharacterManager: QuizCharacter;
    public authManager = new LoggedInUserService();
    public highlighter: Highlighter;
    public mousedOverPinyin$ = new ReplaySubject<string | undefined>(1);
    public pronunciationProgressService: PronunciationProgressService;
    public wordRecognitionProgressService: WordRecognitionProgressService;
    public introService: IntroService;
    public alertsService = new AlertsService();
    public requestRecordingService: RequestRecordingService;
    public treeMenuService: TreeMenuService<any, { value: any }>
    public scheduleRowsService: ScheduleRowsService;

    public observableService = new ObservableService();

    public imageSearchService = new ImageSearchService();

    readingWordElementMap!: Observable<Dictionary<AtomMetadata[]>>;
    setQuizWord$: Subject<string> = new Subject<string>();
    characterPageWordElementMap$ = new Subject<Dictionary<AtomMetadata[]>>();
    readingWordCounts$: Observable<Dictionary<DocumentWordCount[]>>;
    readingWordSentenceMap: Observable<Dictionary<Segment[]>>;
    highlightAllWithDifficultySignal$ = new BehaviorSubject<boolean>(true);
    library: LibraryService;
    modesService = new ModesService();
    pronunciationVideoService = new PronunciationVideoService();
    videoMetadataService: VideoMetadataService;
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
    availableDocumentsService: AvailableDocumentsService;
    documentSelectionService: DocumentSelectionService;
    readingDocumentService: ReadingDocumentService;
    exampleSentencesService: ExampleSentencesService;
    public quizService: QuizService;
    public goalsService: GoalsService;
    public activeSentenceService: ActiveSentenceService;
    public aggregateElementIndexService: AggregateElementIndexService;
    public wordMetadataMapService: WordMetadataMapService;

    constructor(public db: DatabaseService, {audioSource}: AppContext) {
        this.availableDocumentsService = new AvailableDocumentsService()
        this.settingsService = new SettingsService({db})
        this.treeMenuService = new TreeMenuService<any, { value: any }>({
            settingsService: this.settingsService
        });
        this.hotkeysService = new HotkeysService({settingsService: this.settingsService})
        this.hotkeyEvents = new HotKeyEvents(this)
        this.activeSentenceService = new ActiveSentenceService({settingsService: this.settingsService})
        this.browserInputs = new BrowserInputs({
            hotkeys$: this.hotkeysService.mapHotkeysWithDefault(
                HotKeyEvents.defaultHotkeys(),
                this.hotkeyEvents.hotkeyActions(),
            ),
            activeSentenceService: this.activeSentenceService,
            settings$: this.settingsService,

        });
        this.documentRepository = new DocumentRepository({databaseService: this.db});

        this.cardService = new CardService(this.db);
        this.library = new LibraryService({
            db,
            settingsService: this.settingsService,
            documentRepository: this.documentRepository,
            availableDocumentsService: this.availableDocumentsService
        });
        this.documentCheckingOutService = new DocumentCheckingOutService({settingsService: this.settingsService})
        this.droppedFilesService = new DroppedFilesService();
        this.openDocumentsService = new OpenDocumentsService({
            trie$: this.cardService.trie$,
            db,
            settingsService: this.settingsService,
            libraryService: this.library
        });
        this.aggregateElementIndexService = new AggregateElementIndexService({
            openDocumentsService: this.openDocumentsService
        })


        this.openDocumentsService.newOpenDocumentDocumentBodies$.subscribe(body => this.browserInputs.applyDocumentListeners(body.ownerDocument as HTMLDocument))
        this.uploadingDocumentsService = new UploadingDocumentsService({
            loggedInUserService: this.authManager,
            availableDocumentService: this.availableDocumentsService,
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
            this.openDocumentsService.sourceDocumentTabulation$
        );
        this.readingWordElementMap = wordElementMap$;
        this.readingWordCounts$ = documentWordCounts;
        this.readingWordSentenceMap = sentenceMap$;
        this.pronunciationProgressService = new PronunciationProgressService({db});
        this.wordRecognitionProgressService = new WordRecognitionProgressService({db});
        this.scheduleRowsService = new ScheduleRowsService({
            wordCounts$: this.readingWordCounts$,
            recognitionRecordsService: this.wordRecognitionProgressService,
            pronunciationRecordsService: this.pronunciationProgressService
        })
        this.scheduleManager = new ScheduleService({
                db,
                sortMode$: of('').pipe(shareReplay(1)),
                scheduleRowsService: this.scheduleRowsService
            }
        );

        this.exampleSentencesService = new ExampleSentencesService({
            openDocumentsService: this.openDocumentsService,
        })
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioManager = new AudioManager(audioSource);
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager({
            wordRecognitionRows$: this.wordRecognitionProgressService.records$,
            scheduleRows$: this.scheduleRowsService.indexedScheduleRows$
        });
        this.quizManager = new QuizManager({
                scheduledCards$: this.scheduleManager.wordQuizList$.pipe(
                    map(rows => rows.map(row => row.word)),
                    resolveICardForWords(this.cardService.cardIndex$)
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
        this.quizCharacterManager = new QuizCharacter(
            {
                quizzingCard$: this.quizManager.quizzingCard$,
                trie$: this.cardService.trie$,
            }
        )

        CardScheduleQuiz(this.cardService, this.scheduleManager, this.quizManager);
        InputPage(this.browserInputs, this.openDocumentsService);
        CardPage(this.cardService, this.openDocumentsService);
        InputQuiz(this.browserInputs, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardService, this.openDocumentsService, this.editingCardManager, this.cardDBManager, this.audioManager)

        merge(
            this.openDocumentsService.renderedAtomizedSentences$,
            this.quizCharacterManager.atomizedSentenceMap$
        ).subscribe(indexedSentences => {
                Object.values(indexedSentences).map(sentences => this.browserInputs.applySegmentListeners(sentences))
            }
        );
        this.readingDocumentService = new ReadingDocumentService({
            trie$: this.cardService.trie$,
            openDocumentsService: this.openDocumentsService,
            settingsService: this.settingsService
        });
        // this.visibleSentencesService = new VisibleSentencesService({readingDocumentService: this.readingDocumentService})
        this.quizService = new QuizService({
            scheduleService: this.scheduleManager,
            exampleSentencesService: this.exampleSentencesService,
            trie$: this.cardService.trie$,
            cardService: this.cardService,
            openDocumentsService: this.openDocumentsService
        })
        this.visibleElementsService = new VisibleElementsService({
            componentInView$: this.treeMenuService.selectedComponentNode$.pipe(
                map(component => component?.name || '')
            ),
            openDocumentsService: this.openDocumentsService,
            quizService: this.quizService
        });
        this.wordMetadataMapService = new WordMetadataMapService({
            visibleElementsService: this.visibleElementsService,
            aggregateElementIndexService: this.aggregateElementIndexService
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
            resolveICardForWord<string, ICard>(this.cardService.cardIndex$)
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


        this.videoMetadataService = new VideoMetadataService({
                allSentences$: this.openDocumentsService.tabulationsOfCheckedOutDocuments$.pipe(
                    switchMap(async tabulation => {
                        return new Set<string>(Object.keys(tabulation.segments));
                    }),
                    shareReplay(1)
                )
            }
        )


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


        new SentenceVideoHighlightService({
            visibleAtomizedSentences$: this.wordMetadataMapService.visibleWordSegmentMap,
            modesService: this.modesService,
            videoMetadataService: this.videoMetadataService
        });

        new HighlightPronunciationVideoService({
            pronunciationVideoService: this.pronunciationVideoService,
            highlighterService: this.highlighterService,
            wordMetadataMapService: this.wordMetadataMapService
        })

        this.temporaryHighlightService = new TemporaryHighlightService({
            highlighterService: this.highlighterService,
            cardService: this.cardService
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
            cardService: this.cardService,
            pronunciationProgressService: this.pronunciationProgressService,
            wordRecognitionService: this.wordRecognitionProgressService
        })


        this.introSeriesService = new IntroSeriesService({
            settingsService: this.settingsService
        });
        this.introHighlightSeries = new IntroHighlightService({
            temporaryHighlightService: this.temporaryHighlightService,
            atomizedSentences$: this.openDocumentsService.renderedAtomizedSentences$
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
            availableDocumentsService: this.availableDocumentsService,
            settingsService: this.settingsService
        });
        this.requestRecordingService = new RequestRecordingService({
            readingDocumentService: this.readingDocumentService,
            loggedInUserService: this.authManager
        });

        new AtomElementEventsService({
            openDocumentsService: this.openDocumentsService,
            modesService: this.modesService,
            highlighter: this.highlighter,
            pronunciationVideoService: this.pronunciationVideoService,
            browserInputs: this.browserInputs,
            aggregateElementIndexService: this.aggregateElementIndexService
        })

        this.hotkeyEvents.startListeners();
        this.cardService.load();

    }


}



