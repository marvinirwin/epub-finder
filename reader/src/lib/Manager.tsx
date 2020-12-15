import {BehaviorSubject, combineLatest, fromEvent, merge, Observable, of, ReplaySubject, Subject} from "rxjs";
import {debounce, Dictionary} from "lodash";
import {debounceTime, map, shareReplay, startWith, switchMap, withLatestFrom} from "rxjs/operators";
import {DatabaseService} from "./Storage/database.service";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {AudioManager} from "./Manager/AudioManager";
import CardService from "./Manager/CardService";
import {CHARACTER_BOOK_NODE_LABEL, OpenBooksService} from "./Manager/open-books.service";
import {NavigationPages} from "./Util/Util";
import {ScheduleManager} from "./Manager/ScheduleManager";
import {QuizComponent, QuizManager} from "./Manager/QuizManager";
import {BrowserInputs} from "./Hotkeys/BrowserInputs";
import {resolveICardForWord} from "./Pipes/ResolveICardForWord";
import {CardScheduleQuiz} from "./Manager/ManagerConnections/Card-Schedule-Quiz";
import {InputPage} from "./Manager/ManagerConnections/Input-Page";
import {CardPage} from "./Manager/ManagerConnections/Card-Page";
import {InputQuiz} from "./Manager/ManagerConnections/Input-Quiz";
import {ScheduleQuiz} from "./Manager/ManagerConnections/Schedule-Quiz";
import {CreatedSentenceManager} from "./Manager/CreatedSentenceManager";
import {BookWordData, mergeSentenceInfo} from "./Atomized/TextWordData";
import {AtomizedSentence} from "./Atomized/AtomizedSentence";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import EditingCardManager from "./Manager/EditingCardManager";
import {CardPageEditingCardCardDBAudio} from "./Manager/ManagerConnections/Card-Page-EditingCard-CardDB-Audio";
import {ProgressManager} from "./Manager/ProgressManager";
import {AppContext} from "./AppContext/AppContext";
import {ViewingFrameManager} from "./Manager/ViewingFrameManager";
import {OpenBook} from "./BookFrame/OpenBook";
import {QuizCharacter} from "./Manager/QuizCharacter";
import {ds_Dict} from "./Tree/DeltaScanner";
import {RecordRequest} from "./Interfaces/RecordRequest";
import {resolveICardForWords} from "./Pipes/ResultICardForWords";
import axios from 'axios';
import {BookWordCount} from "./Interfaces/BookWordCount";
import {lookupPinyin} from "./ReactiveClasses/EditingCard";
import {Highlighter} from "./Highlighting/Highlighter";
import {AtomizedDocumentBookStats} from "./Atomized/AtomizedDocumentStats";
import {HotKeyEvents} from "./HotKeyEvents";
import {ds_Tree} from "../services/tree.service";
import {Modes, ModesService} from "./Modes/modes.service";
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
import {VisibleSentencesService} from "../services/visible-sentences.service";
import {HighlightPronunciationVideoService} from "../services/highlight-pronunciation-video.service";
import {WordRecognitionProgressService} from "./schedule/word-recognition-progress.service";
import {PronunciationProgressService} from "./schedule/pronunciation-progress.service";
import {QuizResultService} from "./quiz/quiz-result.service";
import {HighlightPronunciationProgressService} from "./Highlighting/highlight-pronunciation-progress.service";
import {HighlightRecollectionDifficultyService} from "./Highlighting/highlight-recollection-difficulty.service";
import {TestHotkeysService} from "./Hotkeys/test-hotkeys.service";
import {CardCreationService} from "./card/card-creation.service";
import {IntroService} from "../lib/intro/intro.service";
import {IntroSeriesService} from "./intro/intro-series.service";
import {IntroHighlightService} from "./intro/intro-highlight.service";
import {ThirdPartyLoginService} from "../services/third-party-login.service";
import {LoggedInUserService} from "./Auth/loggedInUserService";
import {BookCheckingOutService} from "../components/Library/book-checking-out.service";
import {DocumentRepository} from "./documents/document.repository";
import {LibraryService} from "./Manager/library.service";
import {DroppedFilesService} from "./uploading-documents/dropped-files.service";
import {mapToArray} from "./map.module";
import {UploadingDocumentsService} from "./uploading-documents/uploading-documents.service";
import {AvailableBooksService} from "./documents/available-books.service";
import {BookSelectionService} from "./document-selection/book-selection.service";
import {AlertsService} from "../services/alerts.service";
import {ReadingBookService} from "./Manager/reading-book.service";
import {RequestRecordingService} from "../components/PronunciationVideo/request-recording.service";
import {TreeMenuService} from "../services/tree-menu.service";

export type CardDB = IndexDBManager<ICard>;

const addHighlightedWord = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addHighlightedPinyin = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addVideoIndex = debounce((obs$: Subject<number | undefined>, index: number | undefined) => obs$.next(index), 100)

function splitTextDataStreams$(textData$: Observable<BookWordData>) {
    return {
        wordElementMap$: textData$.pipe(map(({wordElementsMap}) => wordElementsMap)),
        wordCounts$: textData$.pipe(map(({wordCounts}) => wordCounts)),
        bookWordCounts: textData$.pipe(map(({bookWordCounts}) => bookWordCounts)),
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
    public cardManager: CardService;
    public openedBooks: OpenBooksService;
    public scheduleManager: ScheduleManager;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public inputManager: BrowserInputs;
    public editingCardManager: EditingCardManager;
    public progressManager: ProgressManager;
    public viewingFrameManager = new ViewingFrameManager();
    public quizCharacterManager: QuizCharacter;
    public authManager = new LoggedInUserService();
    public highlighter: Highlighter;
    public mousedOverPinyin$ = new ReplaySubject<string | undefined>(1);
    public highlightedSentence$ = new ReplaySubject<string | undefined>(1);
    public pronunciationProgressService: PronunciationProgressService;
    public wordRecognitionProgressService: WordRecognitionProgressService;
    public introService: IntroService;
    public alertsService = new AlertsService();
    public requestRecordingService: RequestRecordingService;
    public treeMenuService = new TreeMenuService<any, { value: any }>();

    public observableService = new ObservableService();

    public queryImageRequest$: ReplaySubject<SelectImageRequest | undefined> = new ReplaySubject<SelectImageRequest | undefined>(1);

    bottomNavigationValue$: ReplaySubject<NavigationPages> = LocalStored(
        new ReplaySubject<NavigationPages>(1), 'bottom_navigation_value', NavigationPages.READING_PAGE
    );

    readingWordElementMap!: Observable<Dictionary<IAnnotatedCharacter[]>>;
    setQuizWord$: Subject<string> = new Subject<string>();
    characterPageWordElementMap$ = new Subject<Dictionary<IAnnotatedCharacter[]>>();
    readingWordCounts$: Observable<Dictionary<BookWordCount[]>>;
    readingWordSentenceMap: Observable<Dictionary<AtomizedSentence[]>>;
    highlightAllWithDifficultySignal$ = new BehaviorSubject<boolean>(true);
    library: LibraryService;
    modesService = new ModesService();
    pronunciationVideoService = new PronunciationVideoService();
    videoMetadataService: VideoMetadataService;
    public editingVideoMetadataService: EditingVideoMetadataService;
    private highlighterService: HighlighterService;
    settingsService: SettingsService;
    hotkeysService: HotkeysService
    visibleSentencesService: VisibleSentencesService;
    temporaryHighlightService: TemporaryHighlightService;
    private introSeriesService: IntroSeriesService;
    private introHighlightSeries: IntroHighlightService;
    droppedFilesService: DroppedFilesService;
    bookCheckingOutService: BookCheckingOutService;
    documentRepository: DocumentRepository;
    uploadingDocumentsService: UploadingDocumentsService;
    availableBooksService: AvailableBooksService;
    bookSelectionService: BookSelectionService;
    readingBookService: ReadingBookService;

    constructor(public db: DatabaseService, {audioSource}: AppContext) {
        this.settingsService = new SettingsService({db})
        this.hotkeysService = new HotkeysService({settingsService: this.settingsService})
        this.hotkeyEvents = new HotKeyEvents(this)
        this.inputManager = new BrowserInputs({
            hotkeys$: this.hotkeysService.mapHotkeysWithDefault(
                HotKeyEvents.defaultHotkeys(),
                this.hotkeyEvents.hotkeyActions()
            )
        });
        this.documentRepository = new DocumentRepository({databaseService: this.db});

        this.cardManager = new CardService(this.db);
        this.library = new LibraryService({db, documentRepository: this.documentRepository});
        this.bookCheckingOutService = new BookCheckingOutService({settingsService: this.settingsService})
        this.droppedFilesService = new DroppedFilesService();
        this.openedBooks = new OpenBooksService({
            trie$: this.cardManager.trie$,
            bottomNavigationValue$: this.bottomNavigationValue$,
            db,
            settingsService: this.settingsService,
            libraryService: this.library
        });
        this.openedBooks.renderedElements$
            .subscribe(renderedCharacters => renderedCharacters
                .map(renderedCharacter =>
                    this.applyWordElementListener(renderedCharacter)
                )
            )
        this.openedBooks.newOpenBookDocumentBodies$.subscribe(body => this.inputManager.applyDocumentListeners(body.ownerDocument as HTMLDocument))
        this.uploadingDocumentsService = new UploadingDocumentsService({
            loggedInUserService: this.authManager,
            bookCheckingOutService: this.bookCheckingOutService,
            droppedFilesService: this.droppedFilesService,
            libraryService: this.library
        });
        /*
         * wordElementsMap: Dictionary<IAnnotatedCharacter[]>;
         * wordCounts: Dictionary<number>;
         * wordSentenceMap: Dictionary<AtomizedSentence[]>;
         * sentenceMap: Dictionary<AtomizedSentence[]>;
         */
        const {wordElementMap$, sentenceMap$, bookWordCounts} = splitTextDataStreams$(
            this.openedBooks.renderedBookSentenceData$.pipe(
                map(textData => {
                        return mergeSentenceInfo(...textData);
                    }
                )
            )
        );
        this.readingWordElementMap = wordElementMap$;
        this.readingWordCounts$ = bookWordCounts;
        this.readingWordSentenceMap = sentenceMap$;
        this.pronunciationProgressService = new PronunciationProgressService({db});
        this.wordRecognitionProgressService = new WordRecognitionProgressService({db});
        this.scheduleManager = new ScheduleManager({
                db,
                wordCounts$: this.readingWordCounts$,
                sortMode$: of('').pipe(shareReplay(1)),
                recognitionRecordsService: this.wordRecognitionProgressService
            }
        );
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioManager = new AudioManager(audioSource);
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager({
            wordRecognitionRows$: this.wordRecognitionProgressService.records$,
            scheduleRows$: this.scheduleManager.indexedScheduleRows$
        });
        this.quizManager = new QuizManager({
                scheduledCards$: this.scheduleManager.wordQuizList$.pipe(
                    map(rows => rows.map(row => row.word)),
                    resolveICardForWords(this.cardManager.cardIndex$)
                ),
                requestHighlightedWord: s => {
                }
            },
        );

        new QuizResultService({
            srmService: this.scheduleManager.srmService,
            quizManager: this.quizManager,
            wordRecognitionProgressService: this.wordRecognitionProgressService,
            scheduleManager: this.scheduleManager
        })


        combineLatest([
            this.scheduleManager.indexedScheduleRows$,
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
                exampleSentences$: combineLatest([
                    this.openedBooks.allOpenBooks$
                        .pipe(
                            switchMap(books =>
                                combineLatest(
                                    mapToArray(books, (id, book) => book.bookStats$)
                                )
                            )
                        ),
                    this.quizManager.quizzingCard$
                ]).pipe(
                    map(([textWordData, quizzingCard]: [AtomizedDocumentBookStats[], ICard | undefined]) => {
                        if (!quizzingCard) return [];
                        const limit = 10;
                        let count = 0;
                        const sentenceMatches: ds_Dict<AtomizedSentence> = {};
                        for (let i = 0; i < textWordData.length && count < limit; i++) {
                            const textData = textWordData[i];
                            const wordSentenceMapElement = textData.wordSentenceMap[quizzingCard.learningLanguage];
                            if (wordSentenceMapElement) {
                                const translatableText = wordSentenceMapElement[0].translatableText;
                                if (!sentenceMatches[translatableText]) {
                                    sentenceMatches[translatableText] = wordSentenceMapElement[0];
                                    count++;
                                }
                            }
                        }
                        return Object.values(sentenceMatches);
                    }),
                    shareReplay(1)
                ),
                quizzingCard$: this.quizManager.quizzingCard$,
                trie$: this.cardManager.trie$,
            }
        )

        CardScheduleQuiz(this.cardManager, this.scheduleManager, this.quizManager);
        InputPage(this.inputManager, this.openedBooks);
        CardPage(this.cardManager, this.openedBooks);
        InputQuiz(this.inputManager, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardManager, this.openedBooks, this.editingCardManager, this.cardDBManager, this.audioManager)

        merge(
            this.openedBooks.renderedAtomizedSentences$,
            this.quizCharacterManager.atomizedSentenceMap$
        ).subscribe(indexedSentences => {
                Object.values(indexedSentences).map(sentences => this.inputManager.applyAtomizedSentenceListeners(sentences))
            }
        );
        this.readingBookService = new ReadingBookService({
            trie$: this.cardManager.trie$,
            openBooksService: this.openedBooks,
            settingsService: this.settingsService
        });
        this.visibleSentencesService = new VisibleSentencesService({readingBookService: this.readingBookService})
        this.highlighterService = new HighlighterService(
            {
                wordElementMap$: this.openedBooks.visibleElements$,
                sentenceMap$: this.visibleSentencesService.visibleSentences$
            }
        )

        this.highlighter = new Highlighter({
            highlighterService: this.highlighterService
        })

        this.readingWordElementMap = combineLatest([
            this.readingWordElementMap.pipe(
                startWith({})
            ),
            this.characterPageWordElementMap$.pipe(startWith({}))
        ]).pipe(map((wordElementMaps: Dictionary<IAnnotatedCharacter[]>[]) => {
            return mergeDictArrays<IAnnotatedCharacter>(...wordElementMaps);
        }));


        this.setQuizWord$.pipe(
            resolveICardForWord<string, ICard>(this.cardManager.cardIndex$)
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

        this.inputManager.selectedText$.subscribe(word => {
            this.audioManager.audioRecorder.recordRequest$.next(new RecordRequest(word));
            this.audioManager.queSynthesizedSpeechRequest$.next(word);
            this.editingCardManager.requestEditWord$.next(word);
        });

        combineLatest([
            this.highlightAllWithDifficultySignal$,
            this.scheduleManager.indexedScheduleRows$,
        ]).subscribe(([signal, indexedScheduleRows]) => {
            signal ?
                this.highlighter.highlightWithDifficulty$.next(indexedScheduleRows) :
                this.highlighter.highlightWithDifficulty$.next({})
        })

        combineLatest([
            this.bottomNavigationValue$,
            this.openedBooks.openBookTree.updates$,
        ]).subscribe(
            ([bottomNavigationValue, {sourced}]) => {
                if (!sourced) return;
                switch (bottomNavigationValue) {
                    case NavigationPages.READING_PAGE:
                        const o: ds_Dict<ds_Tree<OpenBook>, string> = sourced.children as ds_Dict<ds_Tree<OpenBook>, string>;
                        this.viewingFrameManager.framesInView.appendDelta$.next({
                            nodeLabel: "root",
                            value: Object.values(o)[0].value
                        })
                        break;
                    case NavigationPages.QUIZ_PAGE:
                        this.viewingFrameManager.framesInView.appendDelta$.next({
                            nodeLabel: 'root',
                            value: this.quizCharacterManager.exampleSentencesBook
                        })
                        break;
                }
            }
        );


        this.audioManager.audioRecorder.audioSource
            .errors$.pipe(AlertsService.pipeToColor('warning'))
            .subscribe(alert => this.alertsService.newAlerts$.next(alert))


        this.videoMetadataService = new VideoMetadataService({
                allSentences$: this.openedBooks.checkedOutBooksData$.pipe(
                    switchMap(async bookWordDatas => {
                        const sentenceSet = new Set<string>();
                        bookWordDatas.forEach(d => Object.values(d.wordSentenceMap).map(s => s.forEach(sentence => sentenceSet.add(sentence.translatableText))));
                        return sentenceSet;
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
            visibleAtomizedSentences$: this.openedBooks.visibleAtomizedSentences$,
            modesService: this.modesService,
            videoMetadataService: this.videoMetadataService
        });

        new HighlightPronunciationVideoService({
            pronunciationVideoService: this.pronunciationVideoService,
            highlighterService: this.highlighterService,
            visibleSentencesService: this.visibleSentencesService
        })

        this.temporaryHighlightService = new TemporaryHighlightService({
            highlighterService: this.highlighterService,
            cardService: this.cardManager
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
            cardService: this.cardManager,
            pronunciationProgressService: this.pronunciationProgressService,
            wordRecognitionService: this.wordRecognitionProgressService
        })


        this.openedBooks.openBookTree.appendDelta$.next({
            nodeLabel: 'root',
            children: {
                [CHARACTER_BOOK_NODE_LABEL]: {
                    nodeLabel: CHARACTER_BOOK_NODE_LABEL,
                    value: this.quizCharacterManager.exampleSentencesBook
                }
            }
        });
        this.introSeriesService = new IntroSeriesService({
            settingsService: this.settingsService
        });
        this.introHighlightSeries = new IntroHighlightService({
            temporaryHighlightService: this.temporaryHighlightService,
            atomizedSentences$: this.openedBooks.renderedAtomizedSentences$
        });
        this.introService = new IntroService({
            pronunciationVideoRef$: this.pronunciationVideoService.videoRef$,
            introSeriesService: new IntroSeriesService({settingsService: this.settingsService}),
            currentVideoMetadata$: this.pronunciationVideoService.videoMetadata$
        });

        this.bookCheckingOutService = new BookCheckingOutService({
            settingsService: this.settingsService
        })
        this.availableBooksService = new AvailableBooksService()
        this.bookSelectionService = new BookSelectionService({
            availableBooksService: this.availableBooksService,
            settingsService: this.settingsService
        });
        this.requestRecordingService = new RequestRecordingService({
            readingBookService: this.readingBookService
        });
        this.hotkeyEvents.startListeners();
        this.cardManager.load();

    }


    applyWordElementListener(annotationElement: IAnnotatedCharacter) {
        const {maxWord, i, parent: sentence} = annotationElement;
        const child: HTMLElement = annotationElement.element as unknown as HTMLElement;
        child.classList.add("applied-word-element-listener");
        fromEvent(child, 'mouseenter')
            .pipe(withLatestFrom(this.modesService.mode$))
            .subscribe(([ev, mode]) => {
                if (maxWord) {
                    addHighlightedPinyin(this.mousedOverPinyin$, lookupPinyin(maxWord.word).join(''));
                    addHighlightedWord(this.highlighter.mousedOverWord$, maxWord?.word);
                }
                return;
                /**
                 * When called on an <iframe> that is not displayed (eg. where display: none is set) Firefox will return null,
                 * whereas other browsers will return a Selection object with Selection.type set to None.
                 */
                /*
                                if ((ev as MouseEvent).shiftKey || mode === Modes.HIGHLIGHT) {
                                    const selection = (annotationElement.element.ownerDocument as Document).getSelection();
                                    if (selection?.anchorNode === child.parentElement) {
                                        selection.extend(child, 1);
                                    } else {
                                        selection?.removeAllRanges();
                                        const range = document.createRange();
                                        range.selectNode(child);
                                        selection?.addRange(range);
                                    }
                                }
                */
            });


        child.onmouseleave = (ev) => {
            addHighlightedWord(this.highlighter.mousedOverWord$, maxWord?.word);
        }

        fromEvent(child, 'click').pipe(
            withLatestFrom(this.modesService.mode$)
        ).subscribe(([event, mode]) => {
            switch (mode) {
                case Modes.VIDEO:
                    this.inputManager.videoCharacterIndex$.next(i);
                    this.pronunciationVideoService.videoSentence$.next(annotationElement.parent.translatableText);
                    break;
                default:
                /*
                TODO do I need this?  I thought highlights were only for mouseenter/mouseleave
                                    const children = sentence.getSentenceHTMLElement().children;
                                    for (let i = 0; i < children.length; i++) {
                                        const child = children[i];
                                        child.classList.remove('highlighted')
                                    }
                */
                /*
                                    this.inputManager.selectedText$.next(maxWord?.word)
                */
            }
        })
        child.onclick = (ev) => {

        };
        return i;
    }
}



