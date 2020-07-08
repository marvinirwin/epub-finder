import {combineLatest, fromEvent, merge, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary, groupBy, orderBy, sortBy, uniq, flatten} from "lodash";
import {
    debounceTime,
    delay,
    filter,
    map,
    pairwise,
    scan,
    shareReplay,
    startWith,
    switchMap,
    switchMapTo,
    take,
    withLatestFrom
} from "rxjs/operators";
/* eslint import/no-webpack-loader-syntax:0 */
import {SerializedAnkiPackage, UnserializedAnkiPackage} from "./Interfaces/OldAnkiClasses/SerializedAnkiPackage";
import DebugMessage from "../Debug-Message";
import {Deck} from "./Interfaces/OldAnkiClasses/Deck";
import {Collection} from "./Interfaces/OldAnkiClasses/Collection";
import {MyAppDatabase} from "./Storage/AppDB";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {WordCountTableRow} from "./ReactiveClasses/WordCountTableRow";
import {EditingCard} from "./ReactiveClasses/EditingCard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {QuizCardProps, ShowCharacter} from "../components/QuizPopup";
import axios from 'axios';
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {ITrend} from "./Interfaces/ITwitterTrend";
import {ITrendLocation} from "./Interfaces/ITrendLocation";
import {WavAudio} from "./WavAudio";
import {IWordCountRow} from "./Interfaces/IWordCountRow";
import {AudioManager} from "./Manager/AudioManager";
import CardManager from "./Manager/CardManager";
import {isChineseCharacter} from "./Interfaces/OldAnkiClasses/Card";
import {IWordRecognitionRow} from "./Interfaces/IWordRecognitionRow";
import {ICountRowEmitted} from "./Interfaces/ICountRowEmitted";
import {mergeWordTextNodeMap} from "./Util/mergeAnnotationDictionary";
import {PageManager} from "./Manager/PageManager";
import {IPositionedWord} from "./Interfaces/Annotation/IPositionedWord";
import {PageRenderer} from "./Pages/Rendering/PageRenderer";
import {Website} from "./Pages/Website";
import {createPopper} from "@popperjs/core";
import {AtomizedSentence} from "./Atomize/AtomizedSentence";
import {getNewICardForWord} from "./Util/Util";
import {printExecTime} from "./Util/Timer";


export enum NavigationPages {
    READING_PAGE = "READING_PAGE",
    QUIZ_PAGE = "QUIZ_PAGE",
    TRENDS_PAGE = "TRENDS_PAGE",
    SETTINGS_PAGE = "SETTINGS_PAGE"
}

async function getAllLocations(): Promise<ITrendLocation[]> {
    const result = await axios.post('/trend-locations')
    const d: ITrendLocation[] = result.data;
    const filtered = d.filter(r => r.country === 'Singapore')
    return result.data;
}

async function getAllTrendsForLocation(woeid: number): Promise<ITrend[]> {
    const result = await axios.post('/trends', {id: woeid})
    return result.data;
}

/*
getAllLocations()
getAllTrendsForLocation(23424948);
*/

export async function getTranslation<A>(learningText: A) {
    const result = await axios.post('/translate', {
        from: 'zh-CN',
        to: 'en',
        text: learningText
    })
    return result.data.translation;
}

export class Manager {
    displayVisible$: ReplaySubject<boolean> = LocalStored(new ReplaySubject<boolean>(1), 'debug_observables_visible', false);
    messagesVisible$: ReplaySubject<boolean> = LocalStored(new ReplaySubject<boolean>(1), 'debug_messages_visible', false);

    packageMessages$: ReplaySubject<string> = new ReplaySubject<string>()

    messageBuffer$: Subject<DebugMessage[]> = new Subject<DebugMessage[]>();

    currentPackage$: ReplaySubject<UnserializedAnkiPackage | undefined> = new ReplaySubject<UnserializedAnkiPackage | undefined>(undefined);
    currentDeck$: Subject<Deck | undefined> = new Subject<Deck | undefined>();
    currentCollection$: Subject<Collection | undefined> = new Subject<Collection | undefined>();

    queEditingCard$: ReplaySubject<EditingCard | undefined> = new ReplaySubject<EditingCard | undefined>(1);
    currentEditingCardIsSaving$!: Observable<boolean | undefined>;
    currentEditingCard$!: Observable<EditingCard | undefined>;
    requestEditWord$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentEditingSynthesizedWavFile$!: Observable<WavAudio>;

    selectionText$: ReplaySubject<string> = new ReplaySubject<string>(1);

    bookIndex$: ReplaySubject<Dictionary<PageRenderer>> = new ReplaySubject<Dictionary<PageRenderer>>(1);

    stringDisplay$: ReplaySubject<string> = new ReplaySubject<string>(1)

    allDebugMessages$: ReplaySubject<DebugMessage> = new ReplaySubject<DebugMessage>();

    wordRowDict: ReplaySubject<Dictionary<WordCountTableRow>> = new ReplaySubject<Dictionary<WordCountTableRow>>(1);
    wordsSortedByPopularityDesc$: ReplaySubject<WordCountTableRow[]> = new ReplaySubject<WordCountTableRow[]>(1)
    addWordCountRows$: Subject<IWordCountRow[]> = new ReplaySubject<IWordCountRow[]>();
    addPersistedWordRecognitionRows$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>();
    addUnpersistedWordRecognitionRows$: ReplaySubject<IWordRecognitionRow[]> = new ReplaySubject<IWordRecognitionRow[]>();

    cardDBManager = new IndexDBManager<ICard>(
        this.db,
        this.db.cards,
        (c: ICard) => c.id,
        (i: number, c: ICard) => ({...c, id: i})
    );


    requestQuizCharacter$: Subject<string> = new Subject<string>();
    quizzingCard$: ReplaySubject<ICard | undefined> = new ReplaySubject<ICard | undefined>(1);
    quizDialogComponent$: ReplaySubject<React.FunctionComponent<QuizCardProps>> = new ReplaySubject<React.FunctionComponent<QuizCardProps>>(1);
    queryImageRequest: ReplaySubject<SelectImageRequest | undefined> = new ReplaySubject<SelectImageRequest | undefined>(1);

    bottomNavigationValue$: ReplaySubject<NavigationPages> = LocalStored(
        new ReplaySubject<NavigationPages>(1), 'bottom_navigation_value', NavigationPages.READING_PAGE
    );

    nextQuizItem$: Observable<ICard | undefined>;

    highlightedWord$ = new ReplaySubject<string | undefined>(1);
    wordElementMap$!: Observable<Dictionary<IAnnotatedCharacter[]>>;
    audioManager: AudioManager;
    cardManager: CardManager;
    pageManager: PageManager;

    renderingInProgress$ = new Subject();

    shiftPressed = false;

    constructor(public db: MyAppDatabase) {
        this.pageManager = new PageManager();
        this.cardManager = new CardManager(this.db);

        this.oPackageLoader();
        this.oMessages();
        this.oEditingCard();


        this.wordElementMap$ = combineLatest(
            [
                this.cardManager.trie$,
                this.pageManager.pageIndex$.pipe(
                    switchMap(pageIndex => merge(
                        ...Object.values(pageIndex)
                            .map(page => page.atomizedSentences$)
                        ).pipe(
                            map(flatten),
                            filter(s => !!s.length)
                        )
                    )
                )
            ]
        ).pipe(map(([trie, atomizedSentences]) => {
            return AtomizedSentence.getWordElementMappings(
                atomizedSentences,
                trie,
                uniq(trie.getWords(false).map(v => v.length))
            );
        }));
        this.nextQuizItem$ = this.wordsSortedByPopularityDesc$.pipe(
            switchMap(rows => combineLatest(rows.map(r =>
                r.lastWordRecognitionRecord$
                    .pipe(
                        map(lastRecord => ({
                                lastRecord,
                                row: r
                            })
                        )
                    )
            )).pipe(debounceTime(100)))
        ).pipe(map(sortedRows => {
                let oneMinute = 60 * 1000;
                const oneMinuteAgo = (new Date()).getTime() - oneMinute;
                // r will be in descending order, so just find the one which has no record, or a record before 1 minute ago
                return sortedRows.find(({lastRecord, row}) => !lastRecord || lastRecord.timestamp.getTime() < oneMinuteAgo)?.lastRecord?.word
            }),
            withLatestFrom(this.cardManager.cardIndex$),
            map(([char, cardMap]) => {
                if (!char) return undefined;
                const cards = cardMap[char] || []
                return cards[0];
            })
        )

        this.oStringDisplay();
        this.oKeyDowns();

        this.oScoreAndCount()
        this.oEditWord();

        this.oQuiz();
        this.oAnnotations();

        this.audioManager = new AudioManager(this)

        this.cardManager.cardProcessingSignal$.pipe(
            filter(b => !b),
            delay(100),
            switchMapTo(this.pageManager.pageIndex$),
            switchMap(pageIndex => merge(...Object.values(pageIndex).map(pageRenderer => pageRenderer.text$))),
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

        this.pageManager.requestRenderPage$.next(new Website('Obama', `${process.env.PUBLIC_URL}/obama.htm`));

        this.pageManager.pageIndex$.pipe(
            switchMap(pageIndex =>
                merge(...Object.values(pageIndex).map(page => page.atomizedSentences$))
            ),
            map(atomizedSentences => atomizedSentences)
        ).subscribe(atomizedSentences => {
            atomizedSentences.forEach(s => {
                const showEvents = ['mouseenter', 'focus'];
                const hideEvents = ['mouseleave', 'blur'];
                let attribute = s.getSentenceHTMLElement().getAttribute('popper-id') as string;
                createPopper(s.getSentenceHTMLElement(), s.getPopperHTMLElement(), {
                    placement: 'top',
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
        this.cardManager.load();
    }

    private oAnnotations() {
        let previousHighlightedElements: HTMLElement[] | undefined;
        /*
                this.bookIndex$.pipe(
                    switchMap(d =>
                        combineLatest(Object.values(d).map(d => d.wordTextNodeMap$))
                    ),
                    map((elCharMaps: Dictionary<IAnnotatedCharacter[]>[]) => {
                        const map: Dictionary<IAnnotatedCharacter[]> = {};
                        elCharMaps.forEach(c => {
                            mergeWordTextNodeMap(c, map)
                        })
                        return map;
                    })
                );
        */


        this.highlightedWord$.pipe(debounceTime(10),
            withLatestFrom(this.wordElementMap$.pipe(startWith({} as Dictionary<IAnnotatedCharacter[]>))))
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
        this.requestQuizCharacter$.pipe(withLatestFrom(this.cardManager.cardIndex$)).subscribe(([char, map]) => {
            if (!map[char]) {
                throw new Error(`Cannot quiz char ${char} because no ICard found`)
            }

            const iCard = map[char][0];
            this.quizzingCard$.next(iCard);
            this.quizDialogComponent$.next(ShowCharacter);
        })
    }

    private oEditWord() {
        this.requestEditWord$.pipe(withLatestFrom(
            this.cardManager.cardIndex$,
            this.currentPackage$.pipe(startWith(undefined)),
            this.currentDeck$.pipe(startWith(undefined)),
            this.currentCollection$.pipe(startWith(undefined)))
        )
            .subscribe(([word, map, ankiPackage, deck, collection]) => {
                const currentICard = map[word];
                let iCard: ICard;
                if (currentICard?.length) {
                    iCard = currentICard[0];
                } else {
                    iCard = getNewICardForWord(word, deck?.name || '');
                }
                this.queEditingCard$.next(EditingCard.fromICard(iCard, this.cardDBManager, this))
            })
    }

    private oKeyDowns() {
        this.stringDisplay$.next('');

        fromEvent(document, 'keydown').pipe(withLatestFrom(
            this.displayVisible$,
            this.messagesVisible$
        )).subscribe(([ev, display, messages]) => {
            document.onkeydown = ev => {
                switch (ev.key) {
                    case "e":
                        if (ev.ctrlKey) {
                            this.displayVisible$.next(!display)
                        }
                        break;
                    case "f":
                        if (ev.ctrlKey) {
                            this.messagesVisible$.next(!messages)
                        }
                        break;
                }
            }
        })
    }

    private oStringDisplay() {
        const observables: Observable<string>[] = [];
        /*
                Object.entries(this).forEach(([key, value]) => {
                    if (key.endsWith('$')) {
                        const obs: Observable<any> = value;
                        if (!key.toLowerCase().includes('message') && !key.toLowerCase().includes('display')) {
                            obs.subscribe(() => this.bookMessages$.next(`${key} fired`))
                        }
                        observables.push(
                            obs.pipe(startWith('Has not emitted'), map(v => {
                                let str = v;
                                switch (key) {
                                    case "currentCards$":
                                        str = `Length: ${v.length}`;
                                        break;
                                    case "currentBook$":
                                        str = v?.name
                                        break;
                                    case "bookDict$":
                                        // @ts-ignore
                                        str = Object.values(v).map((v: RenderingBook) => v.name).join(', ')
                                        break;
                                    default:
                                        if (Array.isArray(v)) {
                                            str = v.join(', ');
                                        }
                                }
                                return `${key} ` + `${str}`.substr(0, 50);
                            }))
                        );
                    }
                })
        */
        combineLatest(observables).pipe(debounceTime(500), map(a => {
            return a.join("</br>")
        })).subscribe(this.stringDisplay$);
    }


    /*
        private oSpine() {
            this.currentSpineItem$.next(undefined);
            this.spineItems$.next([]);
            this.spine$.next(undefined);

            this.spine$.pipe(map(s => {
                if (!s) return;
                const a: aSpineItem[] = [];
                s.each((f: aSpineItem) => {
                    a.push(f);
                })
                return a;
            }))
                .subscribe(v => {
                        this.spineItems$.next(v);
                    }
                );
            this.spineItems$.pipe(withLatestFrom(this.currentSpineItem$)).subscribe(([spineItems, currentItem]) => {
                if (!spineItems) {
                    this.currentSpineItem$.next(undefined);
                    return;
                }
                if (!currentItem || !spineItems.find(i => i.href === currentItem.href)) {
                    this.currentSpineItem$.next(spineItems[0])
                    return;
                }
            })
        }
    */

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

    private oMessages() {
        this.allDebugMessages$ = new ReplaySubject<DebugMessage>();
        this.allDebugMessages$.pipe(scan((acc: DebugMessage[], m) => {
            return [m].concat(acc).slice(0, 100)
        }, [])).subscribe(this.messageBuffer$);

    }

    private oPackageLoader() {
        /*
                const packageLoader: Worker = new AnkiThread();
                packageLoader.onmessage = v => eval(v.data);
                [{name: 'Characters', path: '/files/chars.zip'}].forEach(p => {
                    this.packageMessages$.next(`Requesting Package ${p.name} at ${p.path} `)
                    packageLoader.postMessage(JSON.stringify(p));
                });
        */
    }

    /*
        private oCurrent() {
            this.currentPackage$.next(undefined);
            this.packageUpdate$.pipe(withLatestFrom(this.packages$)).subscribe(([newPackageUpdate, currentPackages]: [UnserializedAnkiPackage, Dictionary<UnserializedAnkiPackage>]) => {
                currentPackages[newPackageUpdate.name] = newPackageUpdate;
                this.packageMessages$.next(`Package ${newPackageUpdate.name} has been updated`)
                if (Object.keys(currentPackages).length === 1) {
                    this.packageMessages$.next(`Setting current package ${newPackageUpdate.name}`)
                    this.currentPackage$.next(newPackageUpdate);
                }
                this.packages$.next({...currentPackages});
            })
            this.currentPackage$.pipe(map(pkg => {
                // This probably wont work
                const col = pkg?.collections?.find(c => c.allCards.length)
                this.packageMessages$.next(`Setting current collection ${col?.name}`)
                this.currentCollection$.next(col?.name);
                let find = col?.decks.find(d => d.cards.length);
                this.packageMessages$.next(`Setting current deck ${find?.name}`)
                return find;
            })).subscribe(this.currentDeck$);
        }
    */

    private oScoreAndCount() {
        this.addWordCountRows$.pipe(scan((acc: Dictionary<WordCountTableRow>, newRows) => {
            const wordCountsGrouped: Dictionary<IWordCountRow[]> = groupBy(newRows, 'word');
            const newObject = {...acc};
            Object.entries(wordCountsGrouped).forEach(([word, wordCountRecords]) => {
                const currentEntry = newObject[word];
                if (!currentEntry) {
                    const newRow = new WordCountTableRow(word);
                    newRow.addCountRecords$.next(wordCountRecords)
                    newObject[word] = newRow;
                } else {
                    currentEntry.addCountRecords$.next(wordCountRecords);
                }
            })
            return newObject;
        }, {})).subscribe(this.wordRowDict);
        this.addUnpersistedWordRecognitionRows$.subscribe((async rows => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                row.id = await this.db.recognitionRecords.add(row);
            }
            this.addPersistedWordRecognitionRows$.next(rows);
        }))
        this.addPersistedWordRecognitionRows$.pipe(withLatestFrom(this.wordRowDict)).subscribe(([newRecognitionRows, rowDict]) => {
            const group = groupBy(newRecognitionRows, v => v.word);
            Object.entries(group).forEach(([word, recognitionRows]) => {
                let rowDictElement = rowDict[word];
                if (!rowDictElement) {
                    // TODO handle the case when recognition records are loaded for words which aren't in the dict
                    return;
                }
                rowDictElement.addNewRecognitionRecords$.next(recognitionRows)
            })
        })
        this.wordRowDict.pipe(
            map(d => Object.values(d)),
            switchMap(wordRows =>
                combineLatest(wordRows.map(r => r.currentCount$.pipe(map(count => ({count, row: r})))))
            ),
            map((recs: ICountRowEmitted[]) => orderBy(
                orderBy(recs, 'recognitionScore', 'desc'), ['count'], 'desc').map(r => r.row))
        ).subscribe(this.wordsSortedByPopularityDesc$)
        this.wordRowDict.pipe(
            map(dict => sortBy(Object.values(dict), d => d.currentCount$.getValue()))
        );
        (async () => {
            const generator = this.db.getRecognitionRowsFromDB();
            for await (let rowChunk of generator) {
                this.addPersistedWordRecognitionRows$.next(rowChunk);
            }
        })()

    }

    receiveDebugMessage(o: any) {
        this.allDebugMessages$.next(new DebugMessage(o.prefix, o.message))
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

    applyGlobalListeners(document: Document) {
        document.onkeydown = (e) => {
            switch (e.key) {
                case "Escape":
                    this.queEditingCard$.next(undefined);
                    break;
                case "Shift":
                    this.shiftPressed = true;
                    break;
            }
        };

        document.onkeyup = (e) => {
            switch (e.key) {
                case "Escape":
                    this.shiftPressed = false;
            }
        }

        const onMouseUp$ = fromEvent(document, 'mouseup');
        onMouseUp$.pipe(withLatestFrom(
            this.cardManager.cardIndex$
            ),
            debounceTime(100)
        ).subscribe(([event, currentDeck]) => {
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
        annotatedElements.getSentenceHTMLElement().onmouseenter = async (ev: MouseEvent) => {
            if (!annotatedElements.translated) {
                const t = await getTranslation(annotatedElements.sentenceElement.textContent)
                annotatedElements.translated = true;
                debugger;
                return annotatedElements.popperElement.textContent = t;
            }
        };
    }

    applyWordElementListener(
        annotationElement: IAnnotatedCharacter,
        maxWord: IPositionedWord,
        i: number,
        sentence: AtomizedSentence) {
        const child: HTMLElement = annotationElement.el as unknown as HTMLElement;
        child.onmouseenter = (ev) => {
            this.highlightedWord$.next(maxWord.word);
            if (this.shiftPressed || ev.shiftKey) {
                const r = document.createRange();
                r.selectNodeContents(child);
                const selObj = (annotationElement.el.ownerDocument as Document).getSelection();
                /**
                 * When called on an <iframe> that is not displayed (eg. where display: none is set) Firefox will return null,
                 * whereas other browsers will return a Selection object with Selection.type set to None.
                 */
                if (selObj) {
                    selObj.addRange(r);
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
            this.requestEditWord$.next(maxWord.word);
        };
        return i;
    }
}



