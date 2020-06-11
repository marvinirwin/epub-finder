import {BehaviorSubject, combineLatest, fromEvent, merge, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary, flatten, groupBy, sortBy} from "lodash";
import {buffer, debounceTime, filter, map, scan, startWith, switchMap, withLatestFrom} from "rxjs/operators";
// @ts-ignore
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AnkiThread from 'worker-loader?name=dist/[name].js!./worker-safe/anki-thread';
import {
    SerializedAnkiPackage,
    UnserializeAnkiPackage,
    UnserializedAnkiPackage
} from "./worker-safe/SerializedAnkiPackage";
import DebugMessage from "../Debug-Message";
import {Deck} from "./worker-safe/Deck";
import {Collection} from "./worker-safe/Collection";
import {MyAppDatabase} from "./AppDB";
import {RenderingBook} from "./RenderingBook";
import React from "react";
import $ from "jquery";
import {getIsMeFunction, ICard} from "./worker-safe/icard";
import {Tweet} from "./Tweet";
import {SimpleText} from "./SimpleText";
import {WordCountTableRow} from "./WordCountTableRow";
import {cBookInstance} from "./cBookInstance";
import {EditingCard} from "./EditingCard";
import Dexie from "dexie";


export interface ISimpleText {
    title: string;
    text: string;
}

export const sleep = (n: number) => new Promise(resolve => setTimeout(resolve, n))

function LocalStored<V, T extends Subject<V>>(t: T, key: string, defaultVal: V): T {
    let text = localStorage.getItem(key);
    if (text) {
        t.next(JSON.parse(text))
    }
    t.subscribe(v => localStorage.setItem(key, JSON.stringify(defaultVal)));
    return t;
}

export const CARD_LOCAL_STORAGE_KEY = 'CARDS';

export class Manager {
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

    addCards$: Subject<ICard[]> = new Subject<ICard[]>();

    currentCardMap$: ReplaySubject<Dictionary<ICard[]>> = new ReplaySubject<Dictionary<ICard[]>>(1);/* = new Subject<Dictionary<ICard>>()*/
    currentCards$: ReplaySubject<ICard[]> = new ReplaySubject<ICard[]>(1);
    allCustomCards$: ReplaySubject<Dictionary<EditingCard>> = new ReplaySubject<Dictionary<EditingCard>>(1)

    newCardRequest$: Subject<ICard> = new Subject();
    cardInEditor$: ReplaySubject<EditingCard | undefined> = new ReplaySubject<EditingCard | undefined>(1)
    requestEditWord$: ReplaySubject<string> = new ReplaySubject<string>(1);

    simpleTextInput$: ReplaySubject<string> = new ReplaySubject<string>(1);
    simpleTextTitle$: ReplaySubject<string> = new ReplaySubject<string>(1);

    twitterUrl$: ReplaySubject<string> = new ReplaySubject<string>(1);
    twitterTitle$: ReplaySubject<string> = new ReplaySubject<string>(1);

    selectionText$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentBook$: ReplaySubject<RenderingBook | undefined> = new ReplaySubject<RenderingBook | undefined>(1)
    bookLoadUpdates$: ReplaySubject<cBookInstance> = new ReplaySubject<cBookInstance>();
    bookDict$: BehaviorSubject<Dictionary<RenderingBook>> = new BehaviorSubject<Dictionary<RenderingBook>>({});
    requestBookRemove$: Subject<RenderingBook> = new Subject<RenderingBook>()

    stringDisplay$: ReplaySubject<string> = new ReplaySubject<string>(1)

    displayVisible$: ReplaySubject<boolean> = LocalStored(new ReplaySubject<boolean>(1), 'debug_observables_visible', false);
    messagesVisible$: ReplaySubject<boolean> = LocalStored(new ReplaySubject<boolean>(1), 'debug_messages_visible', false);
    allDebugMessages$: ReplaySubject<DebugMessage> = new ReplaySubject<DebugMessage>();

    wordRowDict: ReplaySubject<Dictionary<WordCountTableRow>> = new ReplaySubject<Dictionary<WordCountTableRow>>(1);
    sortedWordRows$: ReplaySubject<WordCountTableRow[]> = new ReplaySubject<WordCountTableRow[]>(1)
    addWordCountRows$: Subject<iWordCountRow[]> = new ReplaySubject<iWordCountRow[]>();
    addWordRecognitionRows$: ReplaySubject<iWordRecognitionRow[]> = new ReplaySubject<iWordRecognitionRow[]>();



    cardLocalStorage = new LocalStorageManager(CARD_LOCAL_STORAGE_KEY);

    constructor(public db: MyAppDatabase) {
        this.oPackageLoader();
        this.oMessages();
        this.oCurrent();
        this.oCards();
        /*
                this.oSpine();
        */
        this.oBook();


        this.requestBookRemove$.pipe(withLatestFrom(this.bookDict$, this.currentBook$)).subscribe(([bookToRemove, bookDict, currentBook]) => {
            delete bookDict[bookToRemove.name];
            if (bookToRemove === currentBook) {
                this.currentBook$.next(Object.values(bookDict)[0])
            }
            bookToRemove.removeSerialized();
            this.bookDict$.next(bookDict);
        })
        this.oStringDisplay();
        this.oKeyDowns();

        this.oRender();
        this.oScoreAndCount()
        this.oEditWord();
        this.oLoad();
    }

    private oLoad() {
        const tweetLoader = new LocalStorageManager(Tweet.localStorageKey);
        const simpleTextLoader = new LocalStorageManager(SimpleText.localStorageKey);
        let thingsToLoad = [
            ...tweetLoader.load<Tweet>(Tweet.fromSerialized),
            ...simpleTextLoader.load<SimpleText>(SimpleText.fromSerialized)
        ];
        thingsToLoad.forEach(b => this.bookLoadUpdates$.next(b))
        const cardLoader = new LocalStorageManager(CARD_LOCAL_STORAGE_KEY)
        this.addCards$.next(cardLoader.load<ICard>(v => v));
    }

    private oEditWord() {
        this.requestEditWord$.pipe(withLatestFrom(
            this.currentCardMap$,
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
                    iCard = {
                        learningLanguage: word,
                        photos: [],
                        sounds: [],
                        knownLanguage: [],
                        ankiPackage: ankiPackage?.name,
                        deck: deck?.name,
                        collection: collection?.name,
                        fields: [],
                        illustrationPhotos: [],
                        timestamp: new Date()
                    };
                }
                this.cardInEditor$.next(EditingCard.fromICard(iCard, this.cardLocalStorage))
            })
    }

    private oKeyDowns() {
        this.displayVisible$.next(true);
        this.messagesVisible$.next(true);
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
        this.cardInEditor$.next(undefined);
        this.addCards$.next([]);
        const debouncedAddCards$ = this.addCards$.pipe(debounceTime(1000))
        this.currentCards$.subscribe(v => {
            this.cardMessages$.next(`New current cards ${v.length}`)
        })

        this.addCards$.pipe(buffer(debouncedAddCards$), map(flatten), scan((acc: Dictionary<ICard[]>, newCards: ICard[]) => {
            const o = {...acc};
            newCards.forEach(newICard => {
                Manager.mergeCardIntoCardDict(newICard, o);
            });
            return o;
        }, {})).subscribe(this.currentCardMap$);
        this.currentCardMap$.pipe(map(c => flatten(Object.values(c)))).subscribe(this.currentCards$)

        this.allCustomCards$.next({})
        this.newCardRequest$.pipe(withLatestFrom(this.allCustomCards$)).subscribe(([c, cDict]) => {
            let key = `${c.learningLanguage}_${c.deck}`;
            const presentCard = cDict[key];
            const ec: EditingCard = presentCard || new EditingCard(this.cardLocalStorage);
            ec.knownLanguage$.next(c.knownLanguage);
            ec.characters$.next(c.learningLanguage);
            ec.deck$.next(c.deck || 'NO_DECK_FOR_CARD');
            ec.photos$.next(c.photos);
            ec.sounds$.next(c.sounds);
            if (!presentCard) {
                let value: Dictionary<EditingCard> = {
                    ...cDict,
                    [key]: ec
                };
                this.allCustomCards$.next(value)
            }
        })
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
        const packageLoader: Worker = new AnkiThread();
        packageLoader.onmessage = v => eval(v.data);
        [{name: 'Characters', path: '/chars.zip'}].forEach(p => {
            this.packageMessages$.next(`Requesting Package ${p.name} at ${p.path} `)
            packageLoader.postMessage(JSON.stringify(p));
        });
    }

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

    private oRender() {
        this.renderMessages$.next('Initializing rendering')
    }

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
        this.addWordRecognitionRows$.pipe(withLatestFrom(this.wordRowDict)).subscribe(([newRecognitionRows, rowDict]) => {
            const group = groupBy(newRecognitionRows, v => v);
            // These will always be present in the table records for now
            // If I starting to cache loading this wont be true anymore
            Object.entries(group).forEach(([word, recognitionRows]) => {
                rowDict[word].addNewRecognitionRecords$.next(recognitionRows)
            })
        })
        this.wordRowDict.pipe(
            map(d => Object.values(d)),
            switchMap(wordRows =>
                combineLatest(wordRows.map(r => r.currentCount$.pipe(map(count => ({count, row: r})))))
            ),
            map((recs: iCountRowEmitted[]) => recs.sort((a, b) => {
                if (a.count < b.count) {
                    return 1;
                }
                if (a.count > b.count) {
                    return -1;
                }
                return 0;
            }).map(r => r.row))
        ).subscribe(this.sortedWordRows$)
        this.wordRowDict.pipe(map(dict => sortBy(Object.values(dict), d => d.currentCount$.getValue())))
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


export interface iWordCountRow {
    book: string;
    word: string;
    count: number;
}

export interface iWordRecognitionRow {
    word: string;
    timestamp: Date;
    recognitionScore: number;
}

export interface iCountRowEmitted {
    count: number;
    row: WordCountTableRow
}


export interface HasId {

}
export class IndexDBManager {
    constructor(public db: MyAppDatabase) {}

    async load<FinalType, StoredInDBType>(f: (db: MyAppDatabase) => Promise<StoredInDBType[]>, create: (a: any) => FinalType) {
        return (await f(this.db)).map(create);
    }

    async upsert<StoredInDBType extends HasId>(t: StoredInDBType, table: Dexie.Table<StoredInDBType, number>, getId: (db: MyAppDatabase) => Promise<number | undefined>): Promise<number> {
        let id = await getId(this.db);
        if (id !== undefined) {
            await table.update(id, t)
        } else {
            id = await table.add(t);
        }
        return id;
    }

    async delete<StoredInDBType>(id: number, table: Dexie.Table<StoredInDBType, number>): Promise<undefined> {
        await table.delete(id)
        return;
    }
}

export class LocalStorageManager {
    constructor(public localStorageKey: string) {}

    getLocalStorageArray(): Array<any> {

        const a = this.tryParseLocalstorage();
        if (!Array.isArray(a)) {
            return [];
        }
        return a;
    }

    private tryParseLocalstorage(): any {
        try  {
            return JSON.parse(localStorage.getItem(this.localStorageKey) || '');
        } catch(e) {
            return undefined;
        }
    }

    load<T>(create: (a: any) => T) {
        const stored = this.getLocalStorageArray();
        return stored.map(create);
    }

    upsert(isMe: (a: any) => boolean, meSerialized: any) {
        const serializedInstances = this.getLocalStorageArray();
        const currentMe = serializedInstances.find(serializedObject => isMe(serializedObject))
        if (currentMe) {

            const i = serializedInstances.indexOf(currentMe);
            serializedInstances[i] = meSerialized;
        } else {
            serializedInstances.push(meSerialized);
        }
        localStorage.setItem(this.localStorageKey, JSON.stringify(serializedInstances));
    }

    delete(isMe: (a: any) => boolean) {
        const serializedInstances = this.getLocalStorageArray();
        const currentMe = serializedInstances.filter(serializedObject => isMe(serializedObject))
        if (currentMe) {
            const i = serializedInstances.indexOf(currentMe);
            serializedInstances.splice(i, 1);
        } else {
            throw new Error("Not found in array, cannot delete")
        }
        localStorage.setItem(this.localStorageKey, JSON.stringify(serializedInstances));
    }
}



