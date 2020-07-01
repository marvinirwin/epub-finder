import {BehaviorSubject, combineLatest, fromEvent, merge, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary, groupBy, orderBy, sortBy} from "lodash";
import {
    debounceTime,
    delay,
    filter,
    flatMap,
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
// @ts-ignore
import {
    SerializedAnkiPackage,
    UnserializeAnkiPackage,
    UnserializedAnkiPackage
} from "./Interfaces/OldAnkiClasses/SerializedAnkiPackage";
import DebugMessage from "../Debug-Message";
import {Deck} from "./Interfaces/OldAnkiClasses/Deck";
import {Collection} from "./Interfaces/OldAnkiClasses/Collection";
import {MyAppDatabase} from "./Storage/AppDB";
import {PageRenderer} from "./Books/Rendering/PageRenderer";
import React from "react";
import {ICard} from "./Interfaces/ICard";
import {WordCountTableRow} from "./ReactiveClasses/WordCountTableRow";
import {BookInstance} from "./Books/BookInstance";
import {EditingCard} from "./ReactiveClasses/EditingCard";
import {IndexDBManager} from "./Storage/StorageManagers";
import {QuizCardProps, ShowCharacter} from "../components/QuizPopup";
import axios from 'axios';
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {ITweet} from "./Interfaces/ITweet";
import {ITrend} from "./Interfaces/ITwitterTrend";
import {ITrendLocation} from "./Interfaces/ITrendLocation";
import {WavAudio} from "./WavAudio";
import {IWordCountRow} from "./Interfaces/IWordCountRow";
import {AudioManager} from "./Manager/AudioManager";
import {Website} from "./Books/Website";
import CardManager from "./Manager/CardManager";
import {isChineseCharacter} from "./Interfaces/OldAnkiClasses/Card";
import {IWordRecognitionRow} from "./Interfaces/IWordRecognitionRow";
import {ICountRowEmitted} from "./Interfaces/ICountRowEmitted";
import {mergeWordTextNodeMap} from "./Util/mergeAnnotationDictionary";
import {PageManager} from "./Manager/PageManager";


export const sleep = (n: number) => new Promise(resolve => setTimeout(resolve, n))

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
    debugger;
    return result.data;
}

/*
getAllLocations()
getAllTrendsForLocation(23424948);
*/

export function getNewICardForWord(word: string, deck: string) {
    return {
        learningLanguage: word,
        photos: [],
        sounds: [],
        knownLanguage: [],
        deck: deck,
        fields: [],
        illustrationPhotos: [],
        timestamp: new Date()
    };
}

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

    cardMessages$: ReplaySubject<string> = new ReplaySubject<string>()
    bookMessages$: ReplaySubject<string> = new ReplaySubject<string>()
    renderMessages$: ReplaySubject<string> = new ReplaySubject<string>()
    packageMessages$: ReplaySubject<string> = new ReplaySubject<string>()

    messageBuffer$: Subject<DebugMessage[]> = new Subject<DebugMessage[]>();

    packages$: BehaviorSubject<Dictionary<UnserializedAnkiPackage>> = new BehaviorSubject({});
    packageUpdate$: Subject<UnserializedAnkiPackage> = new Subject<UnserializedAnkiPackage>();

    currentPackage$: ReplaySubject<UnserializedAnkiPackage | undefined> = new ReplaySubject<UnserializedAnkiPackage | undefined>(undefined);
    currentDeck$: Subject<Deck | undefined> = new Subject<Deck | undefined>();
    currentCollection$: Subject<Collection | undefined> = new Subject<Collection | undefined>();


    queEditingCard$: ReplaySubject<EditingCard> = new ReplaySubject<EditingCard>(1);
    currentEditingCardIsSaving$!: Observable<boolean | undefined>;
    currentEditingCard$!: Observable<EditingCard | undefined>;
    requestEditWord$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentEditingSynthesizedWavFile$!: Observable<WavAudio>;

    newCardRequest$: Subject<ICard> = new Subject();
/*
    queEditingCard$: ReplaySubject<EditingCard | undefined> = new ReplaySubject<EditingCard | undefined>(1);
    currentEditingCardIsSaving$: ReplaySubject<boolean | undefined> = new ReplaySubject<boolean | undefined>(1);
    currentEditingCard$: ReplaySubject<EditingCard | undefined> = new ReplaySubject<EditingCard | undefined>(1)
    requestEditWord$: ReplaySubject<string> = new ReplaySubject<string>(1);
*/

    simpleTextDialogOpen$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1)
    simpleTextInput$: ReplaySubject<string> = new ReplaySubject<string>(1);
    simpleTextTitle$: ReplaySubject<string> = new ReplaySubject<string>(1);

    // These two aren't used currently
    twitterUrl$: ReplaySubject<string> = new ReplaySubject<string>(1);
    twitterTitle$: ReplaySubject<string> = new ReplaySubject<string>(1);

    selectionText$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentBook$: ReplaySubject<PageRenderer | undefined> = new ReplaySubject<PageRenderer | undefined>(1)
    bookLoadUpdates$: ReplaySubject<BookInstance> = new ReplaySubject<BookInstance>();
    bookIndex$: BehaviorSubject<Dictionary<PageRenderer>> = new BehaviorSubject<Dictionary<PageRenderer>>({});
    requestBookRemove$: Subject<PageRenderer> = new Subject<PageRenderer>()

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

    nextQuizItem$:Observable<ICard | undefined>;

    allTrends$ = new ReplaySubject<ITrendLocation[]>(1);
    tweetTrendMap$ = new ReplaySubject<Dictionary<ITweet>>();
    selectedTrend$ = new ReplaySubject<ITrendLocation | undefined>();

    highlightedWord$ = new ReplaySubject<string | undefined>(1);
    wordElementMap$ = new ReplaySubject<Dictionary<IAnnotatedCharacter[]>>(1)
    audioManager: AudioManager;
    cardManager: CardManager;
    pageManager: PageManager;
    textToBeTranslated$!: Observable<string>;
    translatedText$!: Observable<string>;

    renderingInProgress$ = new Subject();


    shiftPressed = false;

    constructor(public db: MyAppDatabase) {
        this.pageManager = new PageManager(this);
        this.cardManager = new CardManager(this);
        this.cardManager.load();

        this.oPackageLoader();
        this.oMessages();
/*
        this.oCurrent();
*/
        this.oEditingCard();
        this.oBook();

        /*
                axios.get('/twitter-trends').then(response => {
                    debugger;
                    const data: ITrendLocation[] = response.data;
                    this.allTrends$.next(data);
                })
        */

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

        this.requestBookRemove$.pipe(withLatestFrom(this.bookIndex$, this.currentBook$)).subscribe(([bookToRemove, bookDict, currentBook]) => {
            delete bookDict[bookToRemove.name];
            if (bookToRemove === currentBook) {
                this.currentBook$.next(Object.values(bookDict)[0])
            }
            this.bookIndex$.next({...bookDict});
        });

        this.oStringDisplay();
        this.oKeyDowns();

        this.oScoreAndCount()
        this.oEditWord();

        this.oQuiz();
        this.oAnnotations();

        this.audioManager = new AudioManager(this)

        this.cardManager.cardLoadingSignal$.pipe(
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
            if (newCards.length) {
                debugger;console.log();
            }
            this.cardManager.addUnpersistedCards$.next(newCards);
        });

        this.pageManager.requestRenderPage$.next(new Website('AlphaGo Bilibili', `${process.env.PUBLIC_URL}/alphago_bilibili.htm`));

    }

    private oAnnotations() {
        let previousHighlightedElements: HTMLElement[] | undefined;
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
        ).subscribe(this.wordElementMap$);
        this.highlightedWord$.pipe(debounceTime(10),
            withLatestFrom(this.wordElementMap$))
            .subscribe(([word, dict]) => {
                    if (previousHighlightedElements) {
                        previousHighlightedElements.map(e => e.classList.remove('highlighted'));
                    }
                    if (word) {
                        previousHighlightedElements = dict[word]?.map(annotatedEl => {
                            annotatedEl.el.classList.add('highlighted');
                            return annotatedEl.el;
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

    private oBook() {
        combineLatest([
            this.bookIndex$,
            this.currentBook$
        ]).subscribe(([bookDict, currentBook]) => {
            if (currentBook) {
                // If the bookDict has been updated with a new book,
                // check to see if it was the currentBook which was updated
                if (bookDict[currentBook.name] !== currentBook) {
                    this.currentBook$.next(bookDict[currentBook.name])
                }
            } else {
                if (Object.values(bookDict).length) {
                    this.currentBook$.next(Object.values(bookDict)[0]);
                }
            }

        });
        this.currentBook$.next(undefined);


        this.textToBeTranslated$.subscribe(v => console.log(v))
        this.translatedText$ = this.textToBeTranslated$.pipe(
            debounceTime(100),
            flatMap(async learningText => {
                return await getTranslation(learningText);
            }),
            shareReplay(1)
        );
        this.translatedText$.subscribe(v => console.log(v));
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

        merge(
            this.packageUpdate$.pipe(filter(m => !!m.message), map(m => new DebugMessage(m.name, m.message))),
            this.packageMessages$.pipe(map(m => new DebugMessage('package', m))),
            this.renderMessages$.pipe(map(m => new DebugMessage('render', m))),
            this.bookMessages$.pipe(map(m => new DebugMessage('book', m))),
            this.cardMessages$.pipe(map(m => new DebugMessage('card', m))),
        ).subscribe(this.allDebugMessages$)
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
                debugger;
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

    /*
        async loadEbookInstance(path: string, name: string) {
            this.bookLoadUpdates$.next({
                name,
                book: undefined,
                message: `Loading ${name} from ${path}`,
                serialize: undefined
            });
            const book: Book = Epub(path);
            await book.ready
            this.bookLoadUpdates$.next({
                name,
                book,
                message: `Loaded ${name}`,
                serialize: undefined
            });
        }
    */

    receiveSerializedPackage(s: SerializedAnkiPackage) {
        let cards = s.cards;
        if (cards?.length) {
            this.packageMessages$.next(`Received package with ${cards?.length} cards`)
            /*
                        this.addCards$.next(cards);
            */
        }
        this.packageUpdate$.next(UnserializeAnkiPackage(s))
    }

    initIframeListeners() {
    }

    applyGlobalLIstenersToPage(el: HTMLElement) {
        el.onkeydown = (e) => {
            if (e.key === "Escape") {
                this.queEditingCard$.next(undefined);
            }
        }
    }

    applyShiftListener(el: HTMLElement) {
        el.onkeydown = e => {
            if (e.key === "Shift") {
                this.shiftPressed = true;
            }
        }
        el.onkeyup = e => {
            if (e.key === "Shift") {
                this.shiftPressed = false;
            }
        }
    }
}



