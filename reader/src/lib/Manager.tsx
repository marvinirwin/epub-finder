import {BehaviorSubject, combineLatest, fromEvent, merge, Observable, of, ReplaySubject, Subject} from "rxjs";
import {Dictionary, flatten, groupBy, orderBy, sortBy} from "lodash";
import {
    buffer,
    debounceTime,
    filter, flatMap,
    map,
    pairwise,
    scan,
    shareReplay,
    startWith,
    switchMap,
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
import {mergeAnnotationDictionary, RenderingBook} from "./Books/Rendering/RenderingBook";
import React from "react";
import {getIsMeFunction, ICard} from "./Interfaces/ICard";
import {Tweet} from "./Books/Tweet";
import {SimpleText} from "./Books/SimpleText";
import {WordCountTableRow} from "./ReactiveClasses/WordCountTableRow";
import {BookInstance} from "./Books/BookInstance";
import {EditingCard} from "./ReactiveClasses/EditingCard";
import {IndexDBManager, LocalStorageManager} from "./Storage/StorageManagers";
import {QuizCardProps, ShowCharacter} from "../components/QuizPopup";
import axios from 'axios';
import trie from 'trie-prefix-tree';
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {TrieWrapper} from "./TrieWrapper";
import {LocalStored} from "./Storage/LocalStored";
import {SelectImageRequest} from "./Interfaces/IImageRequest";
import {ITweet} from "./Interfaces/ITweet";
import {ITrend} from "./Interfaces/ITwitterTrend";
import {ITrendLocation} from "./Interfaces/ITrendLocation";
import {WavAudio} from "./WavAudio";
import {Settings} from "./Interfaces/Message";
import {iWordCountRow} from "./Interfaces/IWordCountRow";
import {AudioManager} from "./AudioManager";
import {Website} from "./Books/Website";


export const sleep = (n: number) => new Promise(resolve => setTimeout(resolve, n))

export enum NavigationPages {
    READING_PAGE = "READING_PAGE",
    QUIZ_PAGE = "QUIZ_PAGE",
    TRENDS_PAGE = "TRENDS_PAGE"
}

async function getAllLocations(): Promise<ITrendLocation[]> {
    const result = await axios.post('/trend-locations')
    const d: ITrendLocation[] = result.data;
    const filtered = d.filter(r => r.country === 'Singapore')
    debugger;
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

    addPersistedCards$: Subject<ICard[]> = new Subject<ICard[]>();
    addUnpersistedCards$ = new Subject<ICard[]>();

    cardMap$!: Observable<Dictionary<ICard[]>>;
    trieWrapper = new TrieWrapper(trie([]));

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

    currentBook$: ReplaySubject<RenderingBook | undefined> = new ReplaySubject<RenderingBook | undefined>(1)
    bookLoadUpdates$: ReplaySubject<BookInstance> = new ReplaySubject<BookInstance>();
    bookDict$: BehaviorSubject<Dictionary<RenderingBook>> = new BehaviorSubject<Dictionary<RenderingBook>>({});
    requestBookRemove$: Subject<RenderingBook> = new Subject<RenderingBook>()

    stringDisplay$: ReplaySubject<string> = new ReplaySubject<string>(1)

    allDebugMessages$: ReplaySubject<DebugMessage> = new ReplaySubject<DebugMessage>();

    wordRowDict: ReplaySubject<Dictionary<WordCountTableRow>> = new ReplaySubject<Dictionary<WordCountTableRow>>(1);
    wordsSortedByPopularityDesc$: ReplaySubject<WordCountTableRow[]> = new ReplaySubject<WordCountTableRow[]>(1)
    addWordCountRows$: Subject<iWordCountRow[]> = new ReplaySubject<iWordCountRow[]>();
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
        new ReplaySubject<NavigationPages>(1), 'debug_observables_visible', NavigationPages.READING_PAGE
    );

    nextQuizItem$:Observable<ICard | undefined>;

    allTrends$ = new ReplaySubject<ITrendLocation[]>(1);
    tweetTrendMap$ = new ReplaySubject<Dictionary<ITweet>>();
    selectedTrend$ = new ReplaySubject<ITrendLocation | undefined>();

    highlightedWord$ = new ReplaySubject<string | undefined>(1);
    wordElementMap$ = new ReplaySubject<Dictionary<IAnnotatedCharacter[]>>(1)
    audioManager: AudioManager;
    textToBeTranslated$!: Observable<string>;
    translatedText$!: Observable<string>;

    cardsLeftToLoad$: ReplaySubject<number> = new ReplaySubject<number>(1);

    constructor(public db: MyAppDatabase) {
        this.oPackageLoader();
        this.oMessages();
/*
        this.oCurrent();
*/
        this.oCards();
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
            withLatestFrom(this.cardMap$),
            map(([char, cardMap]) => {
                if (!char) return undefined;
                const cards = cardMap[char] || []
                return cards[0];
            })
        )

        this.requestBookRemove$.pipe(withLatestFrom(this.bookDict$, this.currentBook$)).subscribe(([bookToRemove, bookDict, currentBook]) => {
            delete bookDict[bookToRemove.name];
            if (bookToRemove === currentBook) {
                this.currentBook$.next(Object.values(bookDict)[0])
            }
            bookToRemove.removeSerialized();
            this.bookDict$.next({...bookDict});
        });

        this.oStringDisplay();
        this.oKeyDowns();

        this.oScoreAndCount()
        this.oEditWord();

        this.oQuiz();
        this.oAnnotations();

        this.audioManager = new AudioManager(this)

        this.oLoad();

/*
        (async () => {
            // No blank cards allowed
            this.addPersistedCards$.next((await this.db.cards.where('deck').equals("NO_DECK").toArray()).filter(c => c.learningLanguage))
        })()
*/
    }

    private oAnnotations() {
        let previousHighlightedElements: JQuery<HTMLElement>[] | undefined;
        this.bookDict$.pipe(
            switchMap(d =>
                combineLatest(Object.values(d).map(d => d.annotatedCharMap$))
            ),
            map((elCharMaps: Dictionary<IAnnotatedCharacter[]>[]) => {
                const map: Dictionary<IAnnotatedCharacter[]> = {};
                elCharMaps.forEach(c => {
                    mergeAnnotationDictionary(c, map)
                })
                return map;
            })
        ).subscribe(this.wordElementMap$);
        this.highlightedWord$.pipe(debounceTime(10),
            withLatestFrom(this.wordElementMap$))
            .subscribe(([word, dict]) => {
                    if (previousHighlightedElements) {
                        previousHighlightedElements.map(e => e.removeClass('highlighted'))
                    }
                    if (word) {
                        previousHighlightedElements = dict[word]?.map(annotatedEl => {
                            annotatedEl.el.addClass('highlighted')
                            return annotatedEl.el;
                        });
                    }
                }
            );
    }

    private oQuiz() {
        this.requestQuizCharacter$.pipe(withLatestFrom(this.cardMap$)).subscribe(([char, map]) => {
            if (!map[char]) {
                throw new Error(`Cannot quiz char ${char} because no ICard found`)
            }

            const iCard = map[char][0];
            this.quizzingCard$.next(iCard);
            this.quizDialogComponent$.next(ShowCharacter);
        })
    }

    private async oLoad() {
        const tweetLoader = new LocalStorageManager(Tweet.localStorageKey);
        const simpleTextLoader = new LocalStorageManager(SimpleText.localStorageKey);
/*
        let thingsToLoad = [
            ...tweetLoader.load<Tweet>(Tweet.fromSerialized),
            ...simpleTextLoader.load<SimpleText>(SimpleText.fromSerialized)
        ];
*/
        this.bookLoadUpdates$.next(new Website('AlphaGo Bilibili', `${process.env.PUBLIC_URL}/alphago_bilibili.htm`));
        // thingsToLoad.forEach(b => this.bookLoadUpdates$.next(b))
        let unloadedCardCount = await this.db.getCardsInDatabaseCount()
        this.cardsLeftToLoad$.next(unloadedCardCount);
        if (unloadedCardCount) {
            const priorityCards = await this.db.settings.where({key: Settings.MOST_POPULAR_WORDS}).first();
            const priorityWords = priorityCards?.value || [];
            for await (let cards of this.db.getCardsFromDB({learningLanguage: priorityWords}, 100)) {
                this.addPersistedCards$.next(cards);
                this.cardsLeftToLoad$.next(unloadedCardCount);
            }
            for await (let cards of this.db.getCardsFromDB({}, 500)) {
                unloadedCardCount -= cards.length;
                this.addPersistedCards$.next(cards);
                this.cardsLeftToLoad$.next(unloadedCardCount);
            }

        }

        // Maybe we dont want to load, because the cards we want will be pulled from the anki-thread anyways
        // this.addCards$.next(this.cardDBManager.load((t: Dexie.Table<ICard, number>) => t.toArray()));
    }

    private oEditWord() {
        this.requestEditWord$.pipe(withLatestFrom(
            this.cardMap$,
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
        this.bookLoadUpdates$.pipe(withLatestFrom(this.bookDict$)).subscribe(([instance, dict]) => {
            const currentRender: RenderingBook = dict[instance.name];
            if (currentRender) {
                currentRender.bookInstance$.next(instance);
            } else {
                let renderingBook = new RenderingBook(instance, this, instance.name);
                renderingBook.renderMessages$.pipe(map(m => new DebugMessage(`render-${renderingBook.name}`, m)))
                    .subscribe(this.allDebugMessages$)
                this.bookDict$.next({
                    ...this.bookDict$.getValue(),
                    [instance.name]: renderingBook
                })
            }
        });

        combineLatest([
            this.bookDict$,
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

        this.textToBeTranslated$ = this.bookDict$.pipe(
            switchMap(d => merge(...Object.values(d).map(d => d.currentTranslateText$)))
        )
        this.translatedText$ = this.textToBeTranslated$.pipe(
            debounceTime(100),
            flatMap(async learningText => {
                const result = await axios.post('/translate', {
                    from: 'zh-CN',
                    to: 'en',
                    text: learningText
                })
                return result.data.translation;
            })
        )
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

    private oCards() {
        this.cardMap$ = this.addPersistedCards$.pipe(
            buffer(this.addPersistedCards$.pipe(debounceTime(500))),
            map(flatten),
            scan((acc: Dictionary<ICard[]>, newCards) => {
                const o = {...acc};
                newCards.forEach(newICard => {
                    Manager.mergeCardIntoCardDict(newICard, o);
                    this.trieWrapper.addWords(newICard.learningLanguage);
                });
                return o;
            }, {}),
            shareReplay(1)
            );



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

        this.addUnpersistedCards$.pipe(
            map(async cards => {
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i];
                    card.id = await this.db.cards.add(card);
                }
                return cards;
            })).subscribe((cardsPromise: Promise<ICard[]>) => {
            cardsPromise.then(cardsWithIds => {
                this.addPersistedCards$.next(cardsWithIds);
            })
        })

        this.currentEditingSynthesizedWavFile$ = this.currentEditingCard$.pipe(
            filter(c => !!c),
            switchMap(c => {
                return (c as EditingCard).synthesizedSpeech$;
            })
        )
    }

    private static mergeCardIntoCardDict(newICard: ICard, o: { [p: string]: ICard[] }) {
        const detectDuplicateCard = getIsMeFunction(newICard);
        let presentCards = o[newICard.learningLanguage];
        if (presentCards) {
            const indexOfDuplicateCard = presentCards.findIndex(detectDuplicateCard);
            if (indexOfDuplicateCard >= 0) {
                const presentCard = presentCards[indexOfDuplicateCard];
                if (newICard.timestamp > presentCard.timestamp) {
                    // TODO will I have to update this?
                    // Probably not, if there is an editingCard it will definitely take precendence over this
                    presentCards[indexOfDuplicateCard] = newICard;
                }
            } else {
                presentCards.push(newICard)
            }
        } else {
            o[newICard.learningLanguage] = [newICard]
        }
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
            const wordCountsGrouped: Dictionary<iWordCountRow[]> = groupBy(newRows, 'word');
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
            map((recs: iCountRowEmitted[]) => orderBy(
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
}

export interface IWordRecognitionRow {
    id?: number;
    word: string;
    timestamp: Date;
    recognitionScore: number;
}

export interface iCountRowEmitted {
    count: number;
    row: WordCountTableRow
}


