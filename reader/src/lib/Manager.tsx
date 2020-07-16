import {combineLatest, fromEvent, merge, Observable, of, pipe, ReplaySubject, Subject} from "rxjs";
import {Dictionary, flatten, uniq} from "lodash";
import {
    debounceTime,
    delay,
    filter,
    map,
    pairwise,
    shareReplay,
    startWith,
    switchMap,
    switchMapTo,
    take,
    withLatestFrom
} from "rxjs/operators";
/* eslint import/no-webpack-loader-syntax:0 */
import {SerializedAnkiPackage, UnserializedAnkiPackage} from "./Interfaces/OldAnkiClasses/SerializedAnkiPackage";
import {Deck} from "./Interfaces/OldAnkiClasses/Deck";
import {Collection} from "./Interfaces/OldAnkiClasses/Collection";
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
import {isChineseCharacter} from "./Interfaces/OldAnkiClasses/Card";
import {PageManager} from "./Manager/PageManager";
import {Website} from "./Pages/Website";
import {createPopper} from "@popperjs/core";
import {AtomizedSentence} from "./Atomize/AtomizedSentence";
import {getNewICardForWord, getTranslation, NavigationPages} from "./Util/Util";
import {TextWordData} from "./Atomize/TextWordData";
import {ScheduleManager} from "./Manager/ScheduleManager";
import {QuizManager} from "./Manager/QuizManager";

export const resolveICardForWord = (icardMap$: Observable<Dictionary<ICard[]>>) => (obs$: Observable<string>): Observable<ICard> =>
    obs$.pipe(
        withLatestFrom(icardMap$),
        map(([word, cardIndex]: [string, Dictionary<ICard[]>]) => {
            return cardIndex[word]?.length ? cardIndex[word][0] : getNewICardForWord(word, '')
        })
    );


export class Manager {
    atomizedSentences$: Observable<AtomizedSentence[]>;

    packageMessages$: ReplaySubject<string> = new ReplaySubject<string>()

    currentPackage$: ReplaySubject<UnserializedAnkiPackage | undefined> = new ReplaySubject<UnserializedAnkiPackage | undefined>(undefined);
    currentDeck$: Subject<Deck | undefined> = new Subject<Deck | undefined>();
    currentCollection$: Subject<Collection | undefined> = new Subject<Collection | undefined>();

    queEditingCard$: ReplaySubject<EditingCard | undefined> = new ReplaySubject<EditingCard | undefined>(1);
    currentEditingCardIsSaving$!: Observable<boolean | undefined>;
    currentEditingCard$!: Observable<EditingCard | undefined>;
    requestEditWord$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentEditingSynthesizedWavFile$!: Observable<WavAudio>;

    selectionText$: ReplaySubject<string> = new ReplaySubject<string>(1);

    cardDBManager = new IndexDBManager<ICard>(
        this.db,
        this.db.cards,
        (c: ICard) => c.id,
        (i: number, c: ICard) => ({...c, id: i})
    );

    queryImageRequest: ReplaySubject<SelectImageRequest | undefined> = new ReplaySubject<SelectImageRequest | undefined>(1);

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

    renderingInProgress$ = new Subject();

    textData$: Observable<TextWordData>;

    setQuizWord$: Subject<string> = new Subject<string>();

    constructor(public db: MyAppDatabase) {
        this.pageManager = new PageManager();
        this.quizManager = new QuizManager();
        this.cardManager = new CardManager(this.db);
        this.scheduleManager = new ScheduleManager(this.db);

        this.oEditingCard();

        this.pageManager.pageList$.pipe(
            switchMap(pageList => merge(...pageList.map(p => p.iframebody$))),
        ).subscribe(body => {
            this.applyGlobalListeners(body)
        })

        this.atomizedSentences$ = this.pageManager.pageList$.pipe(
            switchMap(pageList => merge(
                ...pageList.map(page => page.atomizedSentences$)
                ).pipe(map(flatten))
            )
        );

        this.textData$ = combineLatest(
            [
                this.cardManager.trie$,
                this.atomizedSentences$.pipe(filter(sentenceList => !!sentenceList.length))
            ]
        ).pipe(map(([trie, atomizedSentences]) => {
            return AtomizedSentence.getTextWordData(
                atomizedSentences,
                trie,
                uniq(trie.getWords(false).map(v => v.length))
            );
        }));

        this.wordElementMap$ = this.textData$.pipe(map(t => t.wordElementsMap));

        this.wordElementMap$.subscribe(wordElementMap => Object
            .values(wordElementMap)
            .map(elements => elements.forEach(element => this.applyWordElementListener(element)))
        )


        this.oScoreAndCount()
        this.oEditWord();

        this.oQuiz();
        this.oAnnotations();

        this.audioManager = new AudioManager(this)

        this.cardManager.cardProcessingSignal$.pipe(
            filter(b => !b),
            delay(100),
            switchMapTo(this.pageManager.pageList$),
            switchMap(pageList => merge(...pageList.map(pageRenderer => pageRenderer.text$))),
            withLatestFrom(this.cardManager.cardIndex$)
        ).subscribe(([text, cardIndex]) => {
            const newCharacterSet = new Set<string>();
            for (let i = 0; i < text.length; i++) {
                const textElement = text[i];
                if (isChineseCharacter(textElement)) {
                    if (!cardIndex[textElement]) {
                        newCharacterSet.add(textElement);
                    }
                }
            }
            const newCards = Array.from(newCharacterSet.keys()).map(c => getNewICardForWord(c, ''));
            this.cardManager.addUnpersistedCards$.next(newCards);
        });

        this.pageManager.requestRenderPage$.next(
            new Website('Police', `${process.env.PUBLIC_URL}/homework.html`)
        );

        this.pageManager.pageList$.pipe(
            switchMap(pageList =>
                merge(...pageList.map(page => page.atomizedSentences$))
            ),
            map(atomizedSentences => atomizedSentences)
        ).subscribe(atomizedSentences => {
            atomizedSentences.forEach(s => {
                const showEvents = ['mouseenter', 'focus'];
                const hideEvents = ['mouseleave', 'blur'];
                let attribute = s.getSentenceHTMLElement().getAttribute('popper-id') as string;
                createPopper(s.getSentenceHTMLElement(), s.getPopperHTMLElement(), {
                    placement: 'top-start',
                    strategy: 'fixed'
                });

                const show = () => {
                    s.getPopperHTMLElement().setAttribute('data-show', '');
                }
                const hide = () => {
                    (s.getPopperHTMLElement() as unknown as HTMLElement).removeAttribute('data-show');
                }

                showEvents.forEach(event => {
                    s.getSentenceHTMLElement().addEventListener(event, show);
                });

                hideEvents.forEach(event => {
                    s.getSentenceHTMLElement().addEventListener(event, hide);
                });
                this.applySentenceElementSelectListener(s)
            });
        })

        this.setQuizWord$.pipe(
            resolveICardForWord(this.cardManager.cardIndex$)
        ).subscribe((icard) => {
            this.quizManager.setQuizItem(icard);
        })

        this.cardManager.load();
    }

    private oAnnotations() {
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
    }

    private oQuiz() {
        this.scheduleManager.wordsSorted$
            .pipe(
                filter(wordCountTableRows => !!wordCountTableRows.length),
                map(wordCountTableRows => wordCountTableRows[0]?.word),
                resolveICardForWord(this.cardManager.cardIndex$)
            ).subscribe(this.quizManager.nextScheduledQuizItem);

        this.quizManager.completedQuizItem$.pipe(withLatestFrom(this.scheduleManager.wordScheduleRowDict$))
            .subscribe(([scorePair, wordScheduleRowDict]) => {
                debugger;
                let previousRecords = wordScheduleRowDict[scorePair.word]?.wordRecognitionRecords || [];
                const ret = this.scheduleManager.ms.getNextRecognitionRecord(
                    previousRecords,
                    scorePair.score,
                    new Date()
                );
                this.scheduleManager.addUnpersistedWordRecognitionRows$.next([{
                    ...ret,
                    word: scorePair.word,
                    timestamp: new Date(),
                    recognitionScore: scorePair.score,
                }])
            })
    }

    private oEditWord() {
        this.requestEditWord$.pipe(resolveICardForWord(this.cardManager.cardIndex$))
            .subscribe((icard) => {
                this.queEditingCard$.next(EditingCard.fromICard(icard, this.cardDBManager, this))
            })
    }

    private oEditingCard() {
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
    }


    private oScoreAndCount() {
        this.textData$.pipe(
            map(textData => textData.wordCounts),
        ).subscribe(this.scheduleManager.wordCountDict$);
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

    applyGlobalListeners(root: HTMLElement) {
        const document = root.ownerDocument as HTMLDocument;

        root.onkeydown = (e) => {
            switch (e.key) {
                case "Escape":
                    this.queEditingCard$.next(undefined);
                    break;
            }
        };

        const onMouseUp$ = fromEvent(root, 'mouseup');
        const shiftKeyUp$ = new Subject<KeyboardEvent>();
        root.onkeyup = ev => {
            if (ev.key === "Shift") {
                shiftKeyUp$.next(ev);
            }
        };
        merge(shiftKeyUp$, onMouseUp$).subscribe(() => {
            const activeEl = document.activeElement;
            if (activeEl) {
                const selObj = document.getSelection();
                if (selObj) {
                    const text = selObj.toString();
                    if (text) {
                        this.selectionText$.next(text);
                        this.requestEditWord$.next(text);
                    }
                    return;
                }
            }
        })
    }

    applySentenceElementSelectListener(annotatedElements: AtomizedSentence) {
        annotatedElements.getSentenceHTMLElement().setAttribute("Mouseovered", "1");
        annotatedElements.getSentenceHTMLElement().onmouseenter = async (ev: MouseEvent) => {
            if (!annotatedElements.translated) {
                const t = await getTranslation(annotatedElements.sentenceElement.textContent)
                annotatedElements.translated = true;
                return annotatedElements.popperElement.textContent = t;
            }
        };
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



