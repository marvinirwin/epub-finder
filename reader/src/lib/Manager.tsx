import {combineLatest, merge, Observable, of, ReplaySubject, Subject} from "rxjs";
import {debounce, Dictionary, flatten, uniq} from "lodash";
import {debounceTime, filter, map, shareReplay, startWith, switchMap, withLatestFrom, tap} from "rxjs/operators";
import {MyAppDatabase} from "./Storage/AppDB";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {AudioManager} from "./Manager/AudioManager";
import CardManager from "./Manager/CardManager";
import {OpenBookManager} from "./Manager/OpenBookManager";
import {NavigationPages} from "./Util/Util";
import {ScheduleManager} from "./Manager/ScheduleManager";
import {QuizManager} from "./Manager/QuizManager";
import {InputManager} from "./Manager/InputManager";
import {resolveICardForWord} from "./Pipes/ResolveICardForWord";
import {CardScheduleQuiz} from "./Manager/ManagerConnections/Card-Schedule-Quiz";
import {InputPage} from "./Manager/ManagerConnections/Input-Page";
import {CardPage} from "./Manager/ManagerConnections/Card-Page";
import {InputQuiz} from "./Manager/ManagerConnections/Input-Quiz";
import {ScheduleQuiz} from "./Manager/ManagerConnections/Schedule-Quiz";
import {CreatedSentenceManager} from "./Manager/CreatedSentenceManager";
import {SentenceManager} from "./Manager/SentenceManager";
import {TextWordData} from "./Atomized/TextWordData";
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
import {ds_Dict, flattenTree, getElementByKeyPath} from "./Util/DeltaScanner";
import {ITrie} from "./Interfaces/Trie";
import {RecordRequest} from "./Interfaces/RecordRequest";

export type CardDB = IndexDBManager<ICard>;

const addHighlightedWord = debounce((obs$: Subject<string | undefined>, word: string | undefined) => obs$.next(word), 100)

function splitTextDataStreams$(textData$: Observable<TextWordData>) {
    return {
        wordElementMap$: textData$.pipe(map(({wordElementsMap}) => wordElementsMap)),
        wordCounts$: textData$.pipe(map(({wordCounts}) => wordCounts)),
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
    public openedBooksManager: OpenBookManager;
    public scheduleManager: ScheduleManager;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public inputManager = new InputManager();
    public sentenceManager = new SentenceManager();
    public editingCardManager: EditingCardManager;
    public progressManager: ProgressManager;
    public viewingFrameManager = new ViewingFrameManager();
    public quizCharacterManager = new QuizCharacterManager();

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

    characterPageFrame$ = new Subject<OpenBook>();
    wordCounts$: Observable<Dictionary<number>>;
    sentenceMap$: Observable<Dictionary<AtomizedSentence[]>>;
    openBookSentenceData$: Observable<TextWordData[]>;


    constructor(public db: MyAppDatabase, {audioSource, getPageRenderer, getPageSrc}: AppContext) {
        this.openedBooksManager = new OpenBookManager({getPageRenderer});
        this.quizManager = new QuizManager();
        this.cardManager = new CardManager(this.db);
        this.scheduleManager = new ScheduleManager(this.db);
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioManager = new AudioManager(audioSource);
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager();

        CardScheduleQuiz(this.cardManager, this.scheduleManager, this.quizManager);
        InputPage(this.inputManager, this.openedBooksManager);
        CardPage(this.cardManager, this.openedBooksManager);
        InputQuiz(this.inputManager, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardManager, this.openedBooksManager, this.editingCardManager, this.cardDBManager, this.audioManager)
        ScheduleProgress(this.scheduleManager, this.progressManager);

        this.quizCharacterManager.quizzingCard$.addObservable$.next(this.quizManager.quizzingCard$);

        this.openBookSentenceData$ = this
            .openedBooksManager
            .openedBooks
            .mapWith(bookFrame => bookFrame
                .renderer
                .atomizedSentences$
                .obs$.pipe(
                    withLatestFrom(this.cardManager.trie$),
                    map(([sentences, trie]: [ds_Dict<AtomizedSentence>, ITrie]) => {
                            let uniqueLengths: number[] = Object.keys(trie.getWords(false).reduce((acc: { [key: number]: number }, word) => {
                                acc[word.length] = 1;
                                return acc;
                            }, {})).map(str => parseInt(str));
                            return Object.entries(sentences).map(([sentenceStr, sentence]) =>
                                sentence.getTextWordData(trie, uniqueLengths)
                            );
                        }
                    ),
                    shareReplay(1)
                )
            )
            .updates$.pipe(
                switchMap(({sourced}) => combineLatest(sourced ? flattenTree<Observable<TextWordData[]>>(sourced) : [])),
                map((v: TextWordData[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            )
        ;

        let exampleSentences$ = this.openBookSentenceData$.pipe(
            withLatestFrom(this.quizManager.quizzingCard$),
            map(([textWordData, quizzingCard]: [TextWordData[], ICard | undefined]) => {
                if (!quizzingCard) return [];
                const limit = 10;
                const sentenceMatches: AtomizedSentence[] = [];
                for (let i = 0; i < textWordData.length && sentenceMatches.length < limit; i++) {
                    const v = textWordData[i];
                    if (v.wordSentenceMap[quizzingCard.learningLanguage]) {
                        sentenceMatches.push(...v.wordSentenceMap[quizzingCard.learningLanguage]);
                    }
                }
                return sentenceMatches;
            }),
            shareReplay(1)
        );
        this.quizCharacterManager.exampleSentences.addObservable$.next(
            exampleSentences$
        );

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
                InputManager.applyAtomizedSentenceListeners(atomizedSentenceList);
            }
        )

        this.quizCharacterManager.exampleSentencesFrame.frame.iframe$.subscribe(({iframe, body}) => {
            this.inputManager.applyListeners(body);
        });

        const textData$ = combineLatest(
            [
                this.cardManager.trie$,
                this.openedBooksManager.atomizedSentences$.pipe(
                    filter(sentenceList => !!sentenceList.length)
                )
            ]
        ).pipe(map(([trie, atomizedSentences]) => {
            return AtomizedSentence.getTextWordData(
                atomizedSentences,
                trie,
                uniq(trie.getWords(false).map(v => v.length))
            );
        }));
        /*
         * wordElementsMap: Dictionary<IAnnotatedCharacter[]>;
         * wordCounts: Dictionary<number>;
         * wordSentenceMap: Dictionary<AtomizedSentence[]>;
         * sentenceMap: Dictionary<AtomizedSentence[]>;
         */
        const {wordElementMap$, wordCounts$, wordSentenceMap, sentenceMap$} = splitTextDataStreams$(textData$);
        this.wordElementMap$ = wordElementMap$;
        this.wordCounts$ = wordCounts$;
        this.sentenceMap$ = sentenceMap$;

        this.wordElementMap$ = combineLatest([
            this.wordElementMap$.pipe(
                startWith({})
            ),
            this.characterPageWordElementMap$.pipe(startWith({}))
        ]).pipe(map((wordElementMaps: Dictionary<IAnnotatedCharacter[]>[]) => {
            return mergeDictArrays<IAnnotatedCharacter>(...wordElementMaps);
        }));

        this.wordElementMap$.subscribe(wordElementMap => Object
            .values(wordElementMap)
            .map(elements => elements.forEach(element => this.applyWordElementListener(element)))
        )

        this.wordCounts$.subscribe(this.scheduleManager.wordCountDict$);


        let previousHighlightedElements: HTMLElement[] | undefined;
        let previousHighlightedSentences: HTMLElement[] | undefined;

        this.highlightedWord$.pipe(debounceTime(10),
            withLatestFrom(this.wordElementMap$))
            .subscribe(([word, wordElementsMap]) => {
                    if (previousHighlightedElements) {
                        previousHighlightedElements.map(e => e.classList.remove('highlighted'));
                    }
                    if (word) {
                        let dictElement = wordElementsMap[word];
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

        this.inputManager.selectedText$.subscribe(this.editingCardManager.requestEditWord$);

        this.highlightedPinyin$ = this.highlightedWord$.pipe(map(highlightedWord => highlightedWord ? pinyin(highlightedWord).join(' ') : ''))


        combineLatest([
            this.bottomNavigationValue$,
            this.openedBooksManager.openedBooks.updates$,
        ]).subscribe(
            ([bottomNavigationValue, {sourced}]) => {
                if (!sourced) return;
                switch (bottomNavigationValue) {
                    case NavigationPages.READING_PAGE:
/*
                        this.viewingFrameManager.framesInView.appendDelta$.next({
                            nodeLabel: "root",
                            value: elementByKeyPath as OpenBook
                        })
*/
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

        this.cardManager.load();
    }


    applyWordElementListener(annotationElement: IAnnotatedCharacter) {
        const {maxWord, i, parent: sentence} = annotationElement;
        const child: HTMLElement = annotationElement.el as unknown as HTMLElement;
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



