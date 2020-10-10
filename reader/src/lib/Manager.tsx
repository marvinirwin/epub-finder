import {BehaviorSubject, combineLatest, merge, Observable, ReplaySubject, Subject} from "rxjs";
import {debounce, Dictionary} from "lodash";
import {debounceTime, map, shareReplay, startWith} from "rxjs/operators";
import {MyAppDatabase} from "./Storage/AppDB";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {AudioManager} from "./Manager/AudioManager";
import CardManager from "./Manager/CardManager";
import {CHARACTER_BOOK_NODE_LABEL, OpenBooks} from "./Manager/OpenBooks";
import {NavigationPages} from "./Util/Util";
import {ScheduleManager} from "./Manager/ScheduleManager";
import {QuizComponent, QuizManager} from "./Manager/QuizManager";
import {BrowserInputs, filterTextInputEvents} from "./Manager/BrowserInputs";
import {resolveICardForWord} from "./Pipes/ResolveICardForWord";
import {CardScheduleQuiz} from "./Manager/ManagerConnections/Card-Schedule-Quiz";
import {InputPage} from "./Manager/ManagerConnections/Input-Page";
import {CardPage} from "./Manager/ManagerConnections/Card-Page";
import {InputQuiz} from "./Manager/ManagerConnections/Input-Quiz";
import {ScheduleQuiz} from "./Manager/ManagerConnections/Schedule-Quiz";
import {CreatedSentenceManager} from "./Manager/CreatedSentenceManager";
import {BookWordData, mergeSentenceInfo, TextWordData} from "./Atomized/TextWordData";
import {AtomizedSentence} from "./Atomized/AtomizedSentence";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import EditingCardManager from "./Manager/EditingCardManager";
import {CardPageEditingCardCardDBAudio} from "./Manager/ManagerConnections/Card-Page-EditingCard-CardDB-Audio";
import {ScheduleProgress} from "./Manager/ManagerConnections/Schedule-Progress";
import {ProgressManager} from "./Manager/ProgressManager";
import {AppContext} from "./AppContext/AppContext";
import {ViewingFrameManager} from "./Manager/ViewingFrameManager";
import {OpenBook} from "./BookFrame/OpenBook";
import {QuizCharacter} from "./Manager/QuizCharacter";
import {ds_Dict, ds_Tree} from "./Util/DeltaScanner";
import {RecordRequest} from "./Interfaces/RecordRequest";
import {resolveICardForWords} from "./Pipes/ResultICardForWords";
import {AuthenticationMonitor} from "./Manager/AuthenticationMonitor";
import axios from 'axios';
import {BookWordCount} from "./Interfaces/BookWordCount";
import {lookupPinyin} from "./ReactiveClasses/EditingCard";
import {Highlighter} from "./Manager/Highlighter";
import {Library} from "./Manager/Library";

export type CardDB = IndexDBManager<ICard>;

const addHighlightedWord = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addHighlightedPinyin = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)
const addMousedOverIndex = debounce((obs$: Subject<number | undefined>, index: number | undefined) => obs$.next(index), 100)

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
    public audioManager: AudioManager;
    public cardManager: CardManager;
    public openedBooks: OpenBooks;
    public scheduleManager: ScheduleManager;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public inputManager = new BrowserInputs();
    public editingCardManager: EditingCardManager;
    public progressManager: ProgressManager;
    public viewingFrameManager = new ViewingFrameManager();
    public quizCharacterManager: QuizCharacter;
    public authenticationMonitor = new AuthenticationMonitor();
    public highlighter: Highlighter;
    public highlightedPinyin$ = new ReplaySubject<string | undefined>(1);
    public highlightedSentence$ = new ReplaySubject<string | undefined>(1);

    public alertMessages$ = new BehaviorSubject<string[]>([]);
    public alertMessagesVisible$ = new ReplaySubject<boolean>(1);

    queryImageRequest$: ReplaySubject<SelectImageRequest | undefined> = new ReplaySubject<SelectImageRequest | undefined>(1);

    bottomNavigationValue$: ReplaySubject<NavigationPages> = LocalStored(
        new ReplaySubject<NavigationPages>(1), 'bottom_navigation_value', NavigationPages.READING_PAGE
    );

    readingWordElementMap!: Observable<Dictionary<IAnnotatedCharacter[]>>;

    setQuizWord$: Subject<string> = new Subject<string>();

    characterPageWordElementMap$ = new Subject<Dictionary<IAnnotatedCharacter[]>>();

    readingWordCounts$: Observable<Dictionary<BookWordCount[]>>;
    readingWordSentenceMap: Observable<Dictionary<AtomizedSentence[]>>;

    highlightAllWithDifficultySignal$ = new BehaviorSubject<boolean>(true);
    library: Library;



    constructor(public db: MyAppDatabase, {audioSource}: AppContext) {
        axios.interceptors.response.use(
            response => response,
            (error) => {
                // if has response show the error
                if (error.response) {
                    this.alertMessagesVisible$.next(true);
                    this.appendAlertMessage(JSON.stringify(error.response));
                }
            }
        );
        this.cardManager = new CardManager(this.db);
        this.openedBooks = new OpenBooks({
            trie$: this.cardManager.trie$,
            applyListeners: b => this.inputManager.applyDocumentListeners(b),
            bottomNavigationValue$: this.bottomNavigationValue$,
            applyWordElementListener: annotationElement => this.applyWordElementListener(annotationElement),
            applyAtomizedSentencesListener: sentences => this.inputManager.applyAtomizedSentenceListeners(sentences)
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
        this.scheduleManager = new ScheduleManager({db, wordCounts$: this.readingWordCounts$});
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioManager = new AudioManager(audioSource);
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager();
        this.quizManager = new QuizManager({
                scheduledCards$: this.scheduleManager.wordQuizList$.pipe(
                    map(rows => rows.map(row => row.word)),
                    resolveICardForWords(this.cardManager.cardIndex$)
                ),
                requestHighlightedWord: s => {
                }
            },
        );

        this.library = new Library({db});

        combineLatest([
            this.scheduleManager.indexedScheduleRows$,
            this.quizManager.quizzingCard$
        ]).pipe(debounceTime(0)).subscribe(([indexedScheduleRows, quizzingCard]) => {
            if (quizzingCard && !indexedScheduleRows[quizzingCard.learningLanguage]) {
                this.quizManager.requestNextCard$.next();
            }
        });

        // const normalizeSentenceRegexp = /[\u4E00-\uFA29]/;
        this.quizCharacterManager = new QuizCharacter(
            {
                exampleSentences$: combineLatest([
                    this.openedBooks.renderedBookSentenceData$,
                    this.quizManager.quizzingCard$
                ]).pipe(
                    map(([textWordData, quizzingCard]: [TextWordData[], ICard | undefined]) => {
                        if (!quizzingCard) return [];
                        const limit = 10;
                        let count = 0;
                        const sentenceMatches: ds_Dict<AtomizedSentence> = {};
                        for (let i = 0; i < textWordData.length && count < limit; i++) {
                            const textData = textWordData[i];
                            let wordSentenceMapElement = textData.wordSentenceMap[quizzingCard.learningLanguage];
                            if (wordSentenceMapElement) {
                                let translatableText = wordSentenceMapElement[0].translatableText;
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
                requestPlayAudio: sentence => {
                    this.highlighter.mouseoverHighlightedSentences$.next(sentence);
                    this.audioManager.queSynthesizedSpeechRequest$.next(sentence);
                },
                applyAtomizedSentenceListeners: s => this.inputManager.applyAtomizedSentenceListeners(s)
            }
        )

        CardScheduleQuiz(this.cardManager, this.scheduleManager, this.quizManager);
        InputPage(this.inputManager, this.openedBooks);
        CardPage(this.cardManager, this.openedBooks);
        InputQuiz(this.inputManager, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardManager, this.openedBooks, this.editingCardManager, this.cardDBManager, this.audioManager)
        ScheduleProgress(this.scheduleManager, this.progressManager);

        merge(
            this.openedBooks.renderedAtomizedSentences$,
            this.quizCharacterManager.atomizedSentenceMap$
        ).subscribe(indexedSentences => {
                Object.values(indexedSentences).map(sentences => this.inputManager.applyAtomizedSentenceListeners(sentences))
            }
        );

        this.highlighter = new Highlighter({
            visibleElements$: this.openedBooks.visibleElements$,
            visibleSentences$: this.openedBooks.renderedAtomizedSentences$,
            quizWord$: this.quizManager.quizzingCard$.pipe(map(c => c?.learningLanguage))
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

        merge(
            this.inputManager.getKeyDownSubject("Escape"),
            this.inputManager.getKeyDownSubject("q").pipe(filterTextInputEvents),
        ).subscribe(() => this.editingCardManager.showEditingCardPopup$.next(false))

        merge(
            this.inputManager.getKeyDownSubject("d").pipe(filterTextInputEvents),
        ).subscribe(() => this.highlightAllWithDifficultySignal$.next(!this.highlightAllWithDifficultySignal$.getValue()))

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
            this.openedBooks.openedBooks.updates$,
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
        this.audioManager.audioRecorder.audioSource.error$.subscribe(error =>
            this.appendAlertMessage(error)
        )

        this.quizManager.quizStage$.subscribe(stage => {
            switch(stage) {
                case QuizComponent.Characters:
                    this.editingCardManager.showEditingCardPopup$.next(false)
                    break;
                case QuizComponent.Conclusion:
                    this.editingCardManager.showEditingCardPopup$.next(true)
                    break;
            }
        })

        this.openedBooks.openedBooks.appendDelta$.next({
            nodeLabel: 'root',
            children: {
                [CHARACTER_BOOK_NODE_LABEL]: {
                    nodeLabel: CHARACTER_BOOK_NODE_LABEL,
                    value: this.quizCharacterManager.exampleSentencesBook
                }
            }
        });
        this.cardManager.load();
    }

    private appendAlertMessage(error: string) {
        const messages = this.alertMessages$.getValue();
        const MAX_MESSAGES = 10;
        const sliceStart = messages.length - MAX_MESSAGES > 0 ? messages.length - MAX_MESSAGES : 0;
        this.alertMessages$.next(messages.concat(error).slice(sliceStart, sliceStart + MAX_MESSAGES));
    }


    applyWordElementListener(annotationElement: IAnnotatedCharacter) {
        const {maxWord, i, parent: sentence} = annotationElement;
        const child: HTMLElement = annotationElement.element as unknown as HTMLElement;
        child.classList.add("applied-word-element-listener");
        child.onmouseenter = (ev) => {
            if (maxWord) {
                addHighlightedPinyin(this.highlightedPinyin$, lookupPinyin(maxWord.word).join(''));
                addHighlightedWord(this.highlighter.mouseoverHighlightedWords$, maxWord?.word);
                addMousedOverIndex(this.inputManager.hoveredCharacterIndex$, i);
            }
            if (ev.shiftKey) {
                /**
                 * When called on an <iframe> that is not displayed (eg. where display: none is set) Firefox will return null,
                 * whereas other browsers will return a Selection object with Selection.type set to None.
                 */
                const selection = (annotationElement.element.ownerDocument as Document).getSelection();
                if (selection?.anchorNode === child.parentElement) {
                    selection.extend(child, 1);
                } else {
                    selection?.removeAllRanges();
                    let range = document.createRange();
                    range.selectNode(child);
                    selection?.addRange(range);
                }
            }
        };
        child.onmouseleave = (ev) => {
            addHighlightedWord(this.highlighter.mouseoverHighlightedWords$, maxWord?.word);
        }
        child.onclick = (ev) => {
            const children = sentence.getSentenceHTMLElement().children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                child.classList.remove('highlighted')
            }
            this.inputManager.selectedText$.next(maxWord?.word)
        };
        return i;
    }
}



