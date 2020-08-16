import {combineLatest, merge, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary, uniq} from "lodash";
import {
    debounceTime,
    filter,
    map,
    startWith,
    withLatestFrom
} from "rxjs/operators";
import {SerializedAnkiPackage} from "./Interfaces/OldAnkiClasses/SerializedAnkiPackage";
import {MyAppDatabase} from "./Storage/AppDB";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {AudioManager} from "./Manager/AudioManager";
import CardManager from "./Manager/CardManager";
import {PageManager} from "./Manager/PageManager";
import {Website} from "./Website/Website";
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
import {getSrcHttp} from "./Website/Website";

export type CardDB = IndexDBManager<ICard>;

export class Manager {
    public cardDBManager = new IndexDBManager<ICard>(
        this.db,
        this.db.cards,
        (c: ICard) => c.id,
        (i: number, c: ICard) => ({...c, id: i})
    );
    public audioManager: AudioManager;
    public cardManager: CardManager;
    public pageManager: PageManager;
    public scheduleManager: ScheduleManager;
    public quizManager: QuizManager;
    public createdSentenceManager: CreatedSentenceManager;
    public inputManager = new InputManager();
    public sentenceManager = new SentenceManager();

    queryImageRequest$: ReplaySubject<SelectImageRequest | undefined> = new ReplaySubject<SelectImageRequest | undefined>(1);

    bottomNavigationValue$: ReplaySubject<NavigationPages> = LocalStored(
        new ReplaySubject<NavigationPages>(1), 'bottom_navigation_value', NavigationPages.READING_PAGE
    );

    highlightedWord$ = new ReplaySubject<string | undefined>(1);
    highlightedSentence$ = new ReplaySubject<string | undefined>(1)

    wordElementMap$!: Observable<Dictionary<IAnnotatedCharacter[]>>;


    textData$: Observable<TextWordData>;

    setQuizWord: Subject<string> = new Subject<string>();

    characterPageWordElementMap$ = new Subject<Dictionary<IAnnotatedCharacter[]>>();
    highlightedPinyin$: Observable<string>;
    editingCardManager: EditingCardManager;
    progressManager: ProgressManager;


    constructor(public db: MyAppDatabase, {audioSource, getPageRenderer, getPageSrc}: AppContext) {
        this.pageManager = new PageManager({getPageRenderer});
        this.quizManager = new QuizManager();
        this.cardManager = new CardManager(this.db);
        this.scheduleManager = new ScheduleManager(this.db);
        this.createdSentenceManager = new CreatedSentenceManager(this.db);
        this.audioManager = new AudioManager(audioSource);
        this.editingCardManager = new EditingCardManager();
        this.progressManager = new ProgressManager();

        CardScheduleQuiz(this.cardManager, this.scheduleManager, this.quizManager);
        InputPage(this.inputManager, this.pageManager);
        CardPage(this.cardManager, this.pageManager);
        InputQuiz(this.inputManager, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);
        CardPageEditingCardCardDBAudio(this.cardManager, this.pageManager, this.editingCardManager, this.cardDBManager, this.audioManager)
        ScheduleProgress(this.scheduleManager, this.progressManager);

        this.textData$ = combineLatest(
            [
                this.cardManager.trie$,
                this.pageManager.atomizedSentences$.pipe(
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

        this.textData$.subscribe(() => {

        });

        this.wordElementMap$ = combineLatest([
            this.textData$.pipe(
                map(t => t.wordElementsMap),
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

        this.textData$.pipe(
            map(textData => {
                return textData.wordCounts;
            }),
        ).subscribe(this.scheduleManager.wordCountDict$);


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
            withLatestFrom(this.textData$)
        ).subscribe(([sentence, textData]) => {
            if (sentence) {
                const HIGHLIGHTED_SENTENCE = 'highlighted-sentence';
                if (previousHighlightedSentences) {
                    previousHighlightedSentences.map(e => e.classList.remove(HIGHLIGHTED_SENTENCE));
                }
                const dictElement = textData.sentenceMap[sentence]
                previousHighlightedSentences = dictElement?.map(atomizedSentence => {
                    let sentenceHTMLElement = atomizedSentence.getSentenceHTMLElement();
                    sentenceHTMLElement.classList.add(HIGHLIGHTED_SENTENCE);
                    return sentenceHTMLElement;
                });
            }
        })



        this.setQuizWord.pipe(
            resolveICardForWord<string, ICard>(this.cardManager.cardIndex$)
        ).subscribe((icard) => {
            this.quizManager.setQuizItem(icard);
        })

        merge(
            this.inputManager.getKeyDownSubject("Escape"),
            this.inputManager.getKeyDownSubject("q"),
        ).subscribe(() => this.editingCardManager.showEditingCardPopup$.next(false))

        this.inputManager.selectedText$.subscribe(this.editingCardManager.requestEditWord$);

        this.inputManager.getKeyDownSubject('e')
            .subscribe((event) => {
                // Ask for a sentence
                const s = new Subject<string>(); // Is this subject going to stay around, or get garbage collected?
                s.pipe(withLatestFrom(this.textData$)).subscribe(([sentence, textData]) => {
                    if (textData.sentenceMap[sentence]) {
                        // My highlighting logic is insufficient to handle different things
                        this.highlightedWord$.next()
                    }// Maybe I should also do a pinyin map?
                })
            })

        this.highlightedPinyin$ = this.highlightedWord$.pipe(map(highlightedWord => highlightedWord ? pinyin(highlightedWord).join(' ') : ''))
        this.cardManager.load();
    }

    applyWordElementListener(annotationElement: IAnnotatedCharacter) {
        const {maxWord, i, parent: sentence} = annotationElement;
        const child: HTMLElement = annotationElement.el as unknown as HTMLElement;
        child.onmouseenter = (ev) => {
            this.highlightedWord$.next(maxWord?.word);
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
            this.highlightedWord$.next();
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



