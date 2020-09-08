import {BehaviorSubject, combineLatest, merge, Observable, ReplaySubject, Subject} from "rxjs";
import {debounce, Dictionary} from "lodash";
import {debounceTime, map, shareReplay, startWith, switchMap, withLatestFrom} from "rxjs/operators";
import {MyAppDatabase} from "./Storage/AppDB";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {AudioManager} from "./Manager/AudioManager";
import CardManager from "./Manager/CardManager";
import {OpenBooks} from "./Manager/OpenBooks";
import {NavigationPages, sleep} from "./Util/Util";
import {ScheduleManager} from "./Manager/ScheduleManager";
import {QuizManager} from "./Manager/QuizManager";
import {BrowserInputs} from "./Manager/BrowserInputs";
import {resolveICardForWord} from "./Pipes/ResolveICardForWord";
import {CardScheduleQuiz} from "./Manager/ManagerConnections/Card-Schedule-Quiz";
import {InputPage} from "./Manager/ManagerConnections/Input-Page";
import {CardPage} from "./Manager/ManagerConnections/Card-Page";
import {InputQuiz} from "./Manager/ManagerConnections/Input-Quiz";
import {ScheduleQuiz} from "./Manager/ManagerConnections/Schedule-Quiz";
import {CreatedSentenceManager} from "./Manager/CreatedSentenceManager";
import {SentenceManager} from "./Manager/SentenceManager";
import {BookWordData, mergeSentenceInfo, TextWordData} from "./Atomized/TextWordData";
import {AtomizedSentence} from "./Atomized/AtomizedSentence";
import {mergeDictArrays} from "./Util/mergeAnnotationDictionary";
import pinyin from "pinyin";
import EditingCardManager from "./Manager/EditingCardManager";
import {CardPageEditingCardCardDBAudio} from "./Manager/ManagerConnections/Card-Page-EditingCard-CardDB-Audio";
import {ScheduleProgress} from "./Manager/ManagerConnections/Schedule-Progress";
import {ProgressManager} from "./Manager/ProgressManager";
import {AppContext} from "./AppContext/AppContext";
import {ViewingFrameManager} from "./Manager/ViewingFrameManager";
import {OpenBook} from "./BookFrame/OpenBook";
import {QuizCharacterManager} from "./Manager/QuizCharacterManager";
import {ds_Dict, ds_Tree} from "./Util/DeltaScanner";
import {RecordRequest} from "./Interfaces/RecordRequest";
import {resolveICardForWords} from "./Pipes/ResultICardForWords";
import {AuthenticationMonitor} from "./Manager/AuthenticationMonitor";
import axios from 'axios';
import {BookWordCount} from "./Interfaces/BookWordCount";

export type CardDB = IndexDBManager<ICard>;

const addHighlightedWord = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)

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
    public openedBooksManager: OpenBooks;
    public scheduleManager: ScheduleManager;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public inputManager = new BrowserInputs();
    public sentenceManager = new SentenceManager();
    public editingCardManager: EditingCardManager;
    public progressManager: ProgressManager;
    public viewingFrameManager = new ViewingFrameManager();
    public quizCharacterManager: QuizCharacterManager;
    public authenticationMonitor = new AuthenticationMonitor();

    public alertMessages$ = new BehaviorSubject<string[]>([]);
    public alertMessagesVisible$ = new ReplaySubject<boolean>(1);

    queryImageRequest$: ReplaySubject<SelectImageRequest | undefined> = new ReplaySubject<SelectImageRequest | undefined>(1);

    bottomNavigationValue$: ReplaySubject<NavigationPages> = LocalStored(
        new ReplaySubject<NavigationPages>(1), 'bottom_navigation_value', NavigationPages.READING_PAGE
    );

    highlightedWord$ = new ReplaySubject<string | undefined>(1);
    highlightedSentence$ = new ReplaySubject<string | undefined>(1)

    wordElementMap$!: Observable<Dictionary<IAnnotatedCharacter[]>>;

    setQuizWord$: Subject<string> = new Subject<string>();

    characterPageWordElementMap$ = new Subject<Dictionary<IAnnotatedCharacter[]>>();

    highlightedPinyin$: Observable<string>;

    wordCounts$: Observable<Dictionary<BookWordCount[]>>;
    sentenceMap$: Observable<Dictionary<AtomizedSentence[]>>;

    constructor(public db: MyAppDatabase, {audioSource}: AppContext) {
        axios.interceptors.response.use(
            response => response,
            (error) => {
                // if has response show the error
                if (error.response) {
                    this.alertMessagesVisible$.next(true);
                    this.alertMessages$.next(this.alertMessages$.getValue().concat(JSON.stringify(error.response)).slice(0, 10))
                }
            }
        );
        this.cardManager = new CardManager(this.db);
        this.openedBooksManager = new OpenBooks({
            trie$: this.cardManager.trie$,
            applyListeners: b => this.inputManager.applyBodyListeners(b),
            bottomNavigationValue$: this.bottomNavigationValue$,
            applyWordElementListener: annotationElement => this.applyWordElementListener(annotationElement)
        });
        /*
         * wordElementsMap: Dictionary<IAnnotatedCharacter[]>;
         * wordCounts: Dictionary<number>;
         * wordSentenceMap: Dictionary<AtomizedSentence[]>;
         * sentenceMap: Dictionary<AtomizedSentence[]>;
         */
        const {wordElementMap$, wordCounts$, wordSentenceMap, sentenceMap$, bookWordCounts} = splitTextDataStreams$(
            this.openedBooksManager.sourceBookSentenceData$.pipe(
                map(textData => {
                        return mergeSentenceInfo(...textData);
                    }
                )
            )
        );
        this.wordElementMap$ = wordElementMap$;
        this.wordCounts$ = bookWordCounts;
        this.sentenceMap$ = sentenceMap$;
        this.scheduleManager = new ScheduleManager({db, wordCounts$: this.wordCounts$});
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioManager = new AudioManager(audioSource);
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager();
        this.quizManager = new QuizManager({
                scheduledCards$: this.scheduleManager.wordQuizList$.pipe(
                    map(rows => rows.map(row => row.word)),
                    resolveICardForWords(this.cardManager.cardIndex$)
                ),
                requestHighlightedWord: s => this.highlightedWord$.next(s)
            },
        );

        combineLatest([
            this.scheduleManager.indexedScheduleRows$,
            this.quizManager.quizzingCard$
        ]).pipe(debounceTime(0)).subscribe(([indexedScheduleRows, quizzingCard]) => {
            if (quizzingCard && !indexedScheduleRows[quizzingCard.learningLanguage]) {
                this.quizManager.requestNextCard$.next();
            }
        })
        this.quizCharacterManager = new QuizCharacterManager(
            {
                exampleSentences$: combineLatest([
                    this.openedBooksManager.sourceBookSentenceData$,
                    this.quizManager.quizzingCard$
                ]).pipe(
                    map(([textWordData, quizzingCard]: [TextWordData[], ICard | undefined]) => {
                        if (!quizzingCard) return [];
                        const limit = 10;
                        const sentenceMatches: AtomizedSentence[] = [];
                        for (let i = 0; i < textWordData.length && sentenceMatches.length < limit; i++) {
                            const v = textWordData[i];
                            if (v.wordSentenceMap[quizzingCard.learningLanguage]) {
                                sentenceMatches.push(v.wordSentenceMap[quizzingCard.learningLanguage][0]);
                            }
                        }
                        return sentenceMatches;
                    }),
                    shareReplay(1)
                ),
                quizzingCard$: this.quizManager.quizzingCard$,
                trie$: this.cardManager.trie$,
                requestPlayAudio: sentence => {
                    this.highlightedSentence$.next(sentence);
                    this.audioManager.queSynthesizedSpeechRequest$.next(sentence);
                }
            }
        )

        CardScheduleQuiz(this.cardManager, this.scheduleManager, this.quizManager);
        InputPage(this.inputManager, this.openedBooksManager);
        CardPage(this.cardManager, this.openedBooksManager);
        InputQuiz(this.inputManager, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardManager, this.openedBooksManager, this.editingCardManager, this.cardDBManager, this.audioManager)
        ScheduleProgress(this.scheduleManager, this.progressManager);


        /**
         * Maybe later I should only do this if I'm currently at the quiz page
         */
        this.quizManager.quizzingCard$.subscribe(quizzingCard => {
            if (quizzingCard) {
                this.audioManager.audioRecorder.recordRequest$.next(new RecordRequest(quizzingCard.learningLanguage));
            }
        });

        merge(
            this.openedBooksManager.atomizedSentences$,
            this.quizCharacterManager.atomizedSentenceMap$.pipe(map(Object.values))
        ).subscribe(atomizedSentenceList => {
                BrowserInputs.applyAtomizedSentenceListeners(atomizedSentenceList);
            }
        )

        this.quizCharacterManager.exampleSentencesFrame.frame.iframe$.subscribe((iframe: HTMLIFrameElement) => {
            this.inputManager.applyBodyListeners((iframe.contentDocument as Document).body);
        });


        this.wordElementMap$ = combineLatest([
            this.wordElementMap$.pipe(
                startWith({})
            ),
            this.characterPageWordElementMap$.pipe(startWith({}))
        ]).pipe(map((wordElementMaps: Dictionary<IAnnotatedCharacter[]>[]) => {
            return mergeDictArrays<IAnnotatedCharacter>(...wordElementMaps);
        }));


        let previousHighlightedElements: HTMLElement[] | undefined;
        let previousHighlightedSentences: HTMLElement[] | undefined;

        this.highlightedWord$.pipe(debounceTime(10),
            withLatestFrom(this.openedBooksManager.visibleElements$))
            .subscribe(([word, wordElementsMaps]) => {
                    if (previousHighlightedElements) {
                        previousHighlightedElements.map(e => e.classList.remove('highlighted'));
                    }
                    if (word) {
                        let dictElement = wordElementsMaps[word];
                        previousHighlightedElements = dictElement?.map(annotatedEl => {
                            const html = annotatedEl.el as unknown as HTMLElement;
                            html.classList.add('highlighted');
                            return html
                        });
                    }
                }
            );

        this.highlightedSentence$.pipe(
            debounceTime(10),
            withLatestFrom(this.sentenceMap$)
        ).subscribe(([sentence, sentenceMap]) => {
            if (sentence) {
                const HIGHLIGHTED_SENTENCE = 'highlighted-sentence';
                if (previousHighlightedSentences) {
                    previousHighlightedSentences.map(e => e.classList.remove(HIGHLIGHTED_SENTENCE));
                }
                const dictElement = sentenceMap[sentence]
                previousHighlightedSentences = dictElement?.map(atomizedSentence => {
                    let sentenceHTMLElement = atomizedSentence.getSentenceHTMLElement();
                    sentenceHTMLElement.classList.add(HIGHLIGHTED_SENTENCE);
                    return sentenceHTMLElement;
                });
            }
        })


        this.setQuizWord$.pipe(
            resolveICardForWord<string, ICard>(this.cardManager.cardIndex$)
        ).subscribe((icard) => {
            this.quizManager.setQuizCard(icard);
        })

        merge(
            this.inputManager.getKeyDownSubject("Escape"),
            this.inputManager.getKeyDownSubject("q"),
        ).subscribe(() => this.editingCardManager.showEditingCardPopup$.next(false))

        this.inputManager.selectedText$.subscribe(word => {
            this.audioManager.audioRecorder.recordRequest$.next(new RecordRequest(word));
            this.audioManager.queSynthesizedSpeechRequest$.next(word);
            this.editingCardManager.requestEditWord$.next(word);
        });

        this.highlightedPinyin$ = this.highlightedWord$.pipe(map(highlightedWord => highlightedWord ? pinyin(highlightedWord).join(' ') : ''))

        combineLatest([
            this.bottomNavigationValue$,
            this.openedBooksManager.openedBooks.updates$,
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
                            value: this.quizCharacterManager.exampleSentencesFrame
                        })
                        break;
                }
            }
        );

        this.openedBooksManager.openedBooks.appendDelta$.next({
            nodeLabel: 'root',
            children: {
                'characterPageFrame': {
                    nodeLabel: 'characterPageFrame',
                    value: this.quizCharacterManager.exampleSentencesFrame
                }
            }
        });
        this.highlightSavedWord();
        this.cardManager.load();
    }

    private highlightSavedWord() {
        /*
                this.cardManager.addPersistedCards$.pipe(
                    switchMap(atomizedSentences => {
                            return combineLatest(atomizedSentences.map(atomizedSentence => atomizedSentence.newWords$));
                        }
                    ),
                ).subscribe(async (newWordSets: Set<string>[]) => {
                    const bigSet = new Set<string>();
                    for (let i = 0; i < newWordSets.length; i++) {
                        const newWordSet = newWordSets[i];
                        Array.from(newWordSet.values()).forEach(word => bigSet.add(word))
                    }
                    const newWords = Array.from(bigSet);
                    for (let i = 0; i < newWords.length; i++) {
                        const newWord = newWords[i];
                        this.highlightedWord$.next(newWord);
                        await sleep(250);
                    }
                    this.highlightedWord$.next('');
                })
        */
    }

    applyWordElementListener(annotationElement: IAnnotatedCharacter) {
        const {maxWord, i, parent: sentence} = annotationElement;
        const child: HTMLElement = annotationElement.el as unknown as HTMLElement;
        child.classList.add("applied-word-element-listener");
        child.onmouseenter = (ev) => {
            addHighlightedWord(this.highlightedWord$, maxWord?.word);
            if (ev.shiftKey) {
                /**
                 * When called on an <iframe> that is not displayed (eg. where display: none is set) Firefox will return null,
                 * whereas other browsers will return a Selection object with Selection.type set to None.
                 */
                const selection = (annotationElement.el.ownerDocument as Document).getSelection();
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
            addHighlightedWord(this.highlightedWord$, maxWord?.word);
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



