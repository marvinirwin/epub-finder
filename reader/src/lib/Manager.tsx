import {combineLatest, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary, uniq} from "lodash";
import {
    debounceTime,
    delay,
    filter,
    map,
    pairwise,
    shareReplay,
    startWith,
    switchMap,
    take,
    withLatestFrom
} from "rxjs/operators";
/* eslint import/no-webpack-loader-syntax:0 */
import {SerializedAnkiPackage} from "./Interfaces/OldAnkiClasses/SerializedAnkiPackage";
import {MyAppDatabase} from "./Storage/AppDB";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {EditingCard} from "./ReactiveClasses/EditingCard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {WavAudio} from "./WavAudio";
import {AudioManager} from "./Manager/AudioManager";
import CardManager from "./Manager/CardManager";
import {PageManager} from "./Manager/PageManager";
import {Website} from "./Website";
import {AtomizedSentence} from "./Atomize/AtomizedSentence";
import {NavigationPages} from "./Util/Util";
import {TextWordData} from "./Atomize/TextWordData";
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

export class Manager {

    packageMessages$: ReplaySubject<string> = new ReplaySubject<string>()

    queEditingCard$: ReplaySubject<EditingCard | undefined> = new ReplaySubject<EditingCard | undefined>(1);
    currentEditingCardIsSaving$!: Observable<boolean | undefined>;
    currentEditingCard$!: Observable<EditingCard | undefined>;
    requestEditWord$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentEditingSynthesizedWavFile$!: Observable<WavAudio>;

    cardDBManager = new IndexDBManager<ICard>(
        this.db,
        this.db.cards,
        (c: ICard) => c.id,
        (i: number, c: ICard) => ({...c, id: i})
    );

    queryImageRequest$: ReplaySubject<SelectImageRequest | undefined> = new ReplaySubject<SelectImageRequest | undefined>(1);

    bottomNavigationValue$: ReplaySubject<NavigationPages> = LocalStored(
        new ReplaySubject<NavigationPages>(1), 'bottom_navigation_value', NavigationPages.READING_PAGE
    );

    highlightedWord$ = new ReplaySubject<string | undefined>(1);

    wordElementMap$!: Observable<Dictionary<IAnnotatedCharacter[]>>;

    audioManager: AudioManager;
    cardManager: CardManager;
    pageManager: PageManager;
    scheduleManager: ScheduleManager;
    quizManager: QuizManager;
    createdSentenceManager: CreatedSentenceManager;
    inputManager = new InputManager();

    textData$: Observable<TextWordData>;

    setQuizWord: Subject<string> = new Subject<string>();

    constructor(public db: MyAppDatabase) {
        this.pageManager = new PageManager();
        this.quizManager = new QuizManager();
        this.cardManager = new CardManager(this.db);
        this.scheduleManager = new ScheduleManager(this.db);
        this.createdSentenceManager = new CreatedSentenceManager(this.db);

        CardScheduleQuiz(this.cardManager, this.scheduleManager, this.quizManager);
        InputPage(this.inputManager, this.pageManager);
        CardPage(this.cardManager, this.pageManager);
        InputQuiz(this.inputManager, this.quizManager)
        ScheduleQuiz(this.scheduleManager, this.quizManager);

        this.currentEditingCard$ = this.queEditingCard$.pipe(
            startWith(undefined),
            pairwise(),
            switchMap(([previousCard, newCard]) => {
                if (!previousCard) {
                    return of(newCard)
                }
                return this.currentEditingCardIsSaving$.pipe(
                    filter((saving) => !saving),
                    map(() => {
                        previousCard.cardClosed$.next();
                        return newCard;
                    }),
                    take(1)
                )
            }),
        )

        this.currentEditingCardIsSaving$ = this.currentEditingCard$.pipe(
            switchMap(c =>
                c ? c.saveInProgress$ : of(undefined)
            ),
            shareReplay(1)
        );


        this.currentEditingSynthesizedWavFile$ = this.currentEditingCard$.pipe(
            filter(c => !!c),
            switchMap(c => {
                return (c as EditingCard).synthesizedSpeech$;
            })
        )

        this.textData$ = combineLatest(
            [
                this.cardManager.trie$,
                this.pageManager.atomizedSentences$.pipe(filter(sentenceList => !!sentenceList.length))
            ]
        ).pipe(map(([trie, atomizedSentences]) => {
            return AtomizedSentence.getTextWordData(
                atomizedSentences,
                trie,
                uniq(trie.getWords(false).map(v => v.length))
            );
        }));

        this.textData$.subscribe(() => {});

        this.wordElementMap$ = this.textData$.pipe(map(t => t.wordElementsMap));

        this.wordElementMap$.subscribe(wordElementMap => Object
            .values(wordElementMap)
            .map(elements => elements.forEach(element => this.applyWordElementListener(element)))
        )

        this.textData$.pipe(
            map(textData => {
                return textData.wordCounts;
            }),
        ).subscribe(this.scheduleManager.wordCountDict$);

        this.requestEditWord$.pipe(resolveICardForWord<string, ICard>(this.cardManager.cardIndex$))
            .subscribe((icard) => {
                this.queEditingCard$.next(EditingCard.fromICard(icard, this.cardDBManager, this))
            })

        let previousHighlightedElements: HTMLElement[] | undefined;

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

        this.audioManager = new AudioManager(this)

        this.pageManager.requestRenderPage$.next(
            new Website('Police', `${process.env.PUBLIC_URL}/homework.html`)
        );


        this.setQuizWord.pipe(
            resolveICardForWord<string, ICard>(this.cardManager.cardIndex$)
        ).subscribe((icard) => {
            this.quizManager.setQuizItem(icard);
        })

        this.inputManager.getKeyDownSubject("Escape").subscribe(() => this.queEditingCard$.next(undefined))

        this.cardManager.load();
    }

    receiveSerializedPackage(s: SerializedAnkiPackage) {
        let cards = s.cards;
        if (cards?.length) {
            this.packageMessages$.next(`Received package with ${cards?.length} cards`)
            /*
                        this.addCards$.next(cards);
            */
        }
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
            this.requestEditWord$.next(maxWord?.word);
        };
        return i;
    }
}



