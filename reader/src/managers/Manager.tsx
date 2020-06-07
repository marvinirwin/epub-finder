import {BehaviorSubject, combineLatest, fromEvent, merge, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary, flatten} from "lodash";
import {buffer, bufferWhen, debounce, debounceTime, filter, map, scan, startWith, withLatestFrom} from "rxjs/operators";
// @ts-ignore
import {sify} from 'chinese-conv';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AnkiThread from 'worker-loader?name=dist/[name].js!../lib/worker-safe/anki-thread';
import {
    SerializedAnkiPackage,
    UnserializeAnkiPackage,
    UnserializedAnkiPackage
} from "../lib/worker-safe/SerializedAnkiPackage";
import DebugMessage from "../Debug-Message";
import {Deck} from "../lib/worker-safe/Deck";
import {Collection} from "../lib/worker-safe/Collection";
import {MyAppDatabase} from "../AppDB";
import {EditingCard} from "../AppSingleton";
import {aRendition, cBookInstance, RenderingBook, SimpleText, Tweet} from "./RenderingBook";
import Epub, {Book} from "epubjs";
import React from "react";
import $ from "jquery";
import {ICard} from "../lib/worker-safe/icard";

let SIMPLE_TEXT_LOCALSTORAGE_KEY = "SIMPLE_TEXT";

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

    inputText$: ReplaySubject<string> = new ReplaySubject<string>(1);
    titleText$: ReplaySubject<string> = new ReplaySubject<string>(1);

    selectionText$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentBook$: ReplaySubject<RenderingBook | undefined> = new ReplaySubject<RenderingBook | undefined>(1)
    bookLoadUpdates$: ReplaySubject<cBookInstance> = new ReplaySubject<cBookInstance>();
    bookDict$: BehaviorSubject<Dictionary<RenderingBook>> = new BehaviorSubject<Dictionary<RenderingBook>>({});

    stringDisplay$: ReplaySubject<string> = new ReplaySubject<string>(1)

    displayVisible$: ReplaySubject<boolean> = LocalStored(new ReplaySubject<boolean>(1), 'debug_observables_visible', false);
    messagesVisible$: ReplaySubject<boolean> = LocalStored(new ReplaySubject<boolean>(1), 'debug_messages_visible', false);
    allDebugMessages$: ReplaySubject<DebugMessage> = new ReplaySubject<DebugMessage>();

    constructor(public db: MyAppDatabase) {
        this.oPackageLoader();
        this.oMessages();
        this.oCurrent();
        this.oCards();
        /*
                this.oSpine();
        */
        this.oBook();

        // We take this simpleText from locaStorage if we can
        /*
                const obj = localStorage.getItem(SIMPLE_TEXT_LOCALSTORAGE_KEY);
                if (obj) {
                    let unserialized: Dictionary<ISimpleText> = JSON.parse(obj);
                    Object.values(unserialized).forEach(({title, text}) => this.makeSimpleText(title, text))
                } else {
                    this.makeSimpleText(`a tweet`, `
                今年双十一，很多优惠活动的规则，真是令人匪夷所思……
                `)
                }
        */
        let simpleText = new SimpleText('', '');
        let tweet = new Tweet('', '');
        [
            ...simpleText.createFromSerilizedForm(localStorage.getItem(simpleText.localStorageKey) || '{}'),
            ...tweet.createFromSerilizedForm(localStorage.getItem(tweet.localStorageKey) || '{}'),
        ].forEach(b => this.bookLoadUpdates$.next(b))

        this.oStringDisplay();
        this.oKeyDowns();

        this.oRender();
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
        const o = this.addCards$.pipe(debounceTime(1000))
        this.addCards$.pipe(buffer(o), map(flatten), scan((presentCards: ICard[], newCards: ICard[]) => {
            this.cardMessages$.next(`Attempting to add ${newCards.length}`)
            return presentCards.concat(newCards);
        }, [])).subscribe(v => {
            this.currentCards$.next(v);
        });
        this.currentCards$.subscribe(v => {
            this.cardMessages$.next(`New current cards ${v.length}`)
        })

        this.addCards$.pipe(buffer(o), map(flatten), scan((acc: Dictionary<ICard[]>, n: ICard[]) => {
            const o = {...acc};
            n.forEach(v => {
                if (o[v.characters]) {
                    o[v.characters].push(v)
                } else {
                    o[v.characters] = [v]
                }
            });
            return o;
        }, {})).subscribe(this.currentCardMap$);

        this.allCustomCards$.next({})
        this.newCardRequest$.pipe(withLatestFrom(this.allCustomCards$)).subscribe(([c, cDict]) => {
            let key = `${c.characters}_${c.deck}`;
            const presentCard = cDict[key];
            const ec: EditingCard = presentCard || new EditingCard();
            ec.english$.next(c.english);
            ec.characters$.next(c.characters);
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


