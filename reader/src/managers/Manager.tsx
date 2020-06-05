import {BehaviorSubject, combineLatest, fromEvent, merge, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {debounceTime, filter, map, scan, startWith, withLatestFrom} from "rxjs/operators";
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
import {isChineseCharacter} from "../lib/worker-safe/Card";
import {ICard, MyAppDatabase} from "../AppDB";
import {EditingCard, EditingCardInInterface, queryImages} from "../AppSingleton";
import {aRendition, aSpine, aSpineItem, BookInstance} from "./BookManager";
import Epub, {Book} from "epubjs";
import React from "react";
import $ from "jquery";
import {render} from "react-dom";
import {FlashcardPopup} from "../components/FlashcardPopup";

export class Manager {
    stringMessages: ReplaySubject<string> = new ReplaySubject<string>()
    allMessages$: Subject<DebugMessage> = new Subject<DebugMessage>();
    debugMessages: Subject<DebugMessage> = new Subject<DebugMessage>();

    renderMessages$: ReplaySubject<string> = new ReplaySubject<string>();

    packages$: BehaviorSubject<Dictionary<UnserializedAnkiPackage>> = new BehaviorSubject({});
    packageUpdate$: Subject<UnserializedAnkiPackage> = new Subject<UnserializedAnkiPackage>();

    currentPackage$: ReplaySubject<UnserializedAnkiPackage | undefined> = new ReplaySubject<UnserializedAnkiPackage | undefined>(undefined);
    currentDeck$: Subject<Deck | undefined> = new Subject<Deck | undefined>();
    currentCollection$: Subject<Collection | undefined> = new Subject<Collection | undefined>();

    addCard$: Subject<ICard[]> = new Subject<ICard[]>();

    cardIndex$: ReplaySubject<Dictionary<ICard[]>> = new ReplaySubject<Dictionary<ICard[]>>(1);
    currentCardMap$: Subject<Dictionary<ICard[]>> = new Subject<Dictionary<ICard[]>>();/* = new Subject<Dictionary<ICard>>()*/
    currentCards$: ReplaySubject<ICard[]> = new ReplaySubject<ICard[]>(1);
    allCustomCards$: ReplaySubject<Dictionary<EditingCard>> = new ReplaySubject<Dictionary<EditingCard>>(1)

    newCardRequest$: Subject<ICard> = new Subject();
    cardInEditor$: ReplaySubject<EditingCardInInterface | undefined> = new ReplaySubject<EditingCardInInterface | undefined>(1)

    renderRef$: ReplaySubject<HTMLElement> = new ReplaySubject<HTMLElement>(1)
    textSource$: ReplaySubject<string> = new ReplaySubject<string>(1);

    selectionText$: ReplaySubject<string> = new ReplaySubject<string>(1);

    currentBook$: ReplaySubject<BookInstance | undefined> = new ReplaySubject<BookInstance | undefined>(1)
    bookLoadUpdates$: Subject<BookInstance> = new Subject();
    bookDict$: BehaviorSubject<Dictionary<BookInstance>> = new BehaviorSubject<Dictionary<BookInstance>>({});

    bookList$: Subject<BookInstance[]> = new Subject<BookInstance[]>();
    spine$: ReplaySubject<aSpine | undefined> = new ReplaySubject(1);
    spineItems$: ReplaySubject<aSpineItem[] | undefined> = new ReplaySubject<aSpineItem[] | undefined>(1);
    currentSpineItem$: ReplaySubject<aSpineItem | undefined> = new ReplaySubject(1);

    stringDisplay$: ReplaySubject<string> = new ReplaySubject<string>(1)

    displayVisible$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    messagesVisible$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    constructor(public db: MyAppDatabase) {
        this.oPackageLoader();
        this.oMessages();
        this.oCurrent();
        this.oCards();
        this.oSpine();
        this.oBook();
        this.makeSimpleText(`a tweet`, `
        今年双十一，很多优惠活动的规则，真是令人匪夷所思……
        `)

        this.oStringDisplay();
        this.oKeyDowns();
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
                switch(ev.key) {
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
        Object.entries(this).forEach(([k, v]) => {
            if (k.endsWith('$')) {
                const obs: Observable<any> = v;

                observables.push(
                    obs.pipe(startWith(''), map(v => {
                        let str = v;
                        if (Array.isArray(v)) {
                            str = v.join(', ');
                        }
                        return `${k} ` + `${str}`.substr(0, 50);
                    }))
                );
            }
        })
        combineLatest(observables).pipe(debounceTime(500), map(a => {
            return a.join("</br>")
        })).subscribe(this.stringDisplay$);
    }

    private oBook() {
        this.bookList$.next([]);
        this.bookDict$.pipe(map(d => Object.values(d))).subscribe(this.bookList$);
        this.bookLoadUpdates$.subscribe(v => {
            this.bookDict$.next({
                ...this.bookDict$.getValue(),
                [v.name]: v
            })
        });
        this.currentBook$.pipe(map(function (bookInstance: BookInstance | undefined): aSpine | undefined {
            if (bookInstance) {
                if (bookInstance.book) {
                    return bookInstance.book.spine
                }
            }
            return undefined
        })).subscribe(this.spine$);

        combineLatest(this.bookList$, this.currentBook$).subscribe(([bookList, currentBook]) => {
            if (!currentBook?.book) {
                const f = bookList.find((v) => v.book);
                if (f) this.currentBook$.next(f);
            }
        });
        this.currentBook$.next(undefined);
    }

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

    private oCards() {
        this.cardInEditor$.next(undefined);
        this.addCard$.next([]);
        this.addCard$.pipe(scan((presentCards: ICard[], newCards: ICard[]) => {
            this.stringMessages.next(`Cards received ${newCards.length}`)
            return presentCards.concat(newCards);
        }, [])).subscribe(v => {
            this.currentCards$.next(v);
        });
        this.currentCards$.subscribe(v => {
            this.stringMessages.next(`New current cards ${v.length}`)
        })
        this.addCard$.pipe(scan((acc: Dictionary<ICard[]>, n: ICard[]) => {
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
        this.stringMessages.next("Initializing card manager");
        merge(
            this.packageUpdate$.pipe(filter(m => !!m.message), map(m => new DebugMessage(m.name, m.message))),
            this.debugMessages
        ).subscribe(this.allMessages$)
    }

    private oPackageLoader() {
        const packageLoader: Worker = new AnkiThread();
        packageLoader.onmessage = v => eval(v.data);
        [{name: 'Characters', path: '/chars.zip'}].forEach(p => {
            packageLoader.postMessage(JSON.stringify(p));
        });
    }

    private oCurrent() {
        this.currentPackage$.next(undefined);
        this.packageUpdate$.pipe(withLatestFrom(this.packages$)).subscribe(([newPackageUpdate, currentPackages]: [UnserializedAnkiPackage, Dictionary<UnserializedAnkiPackage>]) => {
            currentPackages[newPackageUpdate.name] = newPackageUpdate;
            if (Object.keys(currentPackages).length === 1) {
                this.currentPackage$.next(newPackageUpdate);
            }
            this.packages$.next({...currentPackages});
        })
        this.currentPackage$.pipe(map(pkg => {
            // This probably wont work
            const col = pkg?.collections?.find(c => c.allCards.length)
            this.currentCollection$.next(col?.name);
            return col?.decks.find(d => d.cards.length);
        })).subscribe(this.currentDeck$);
    }

    private oRender() {
        const renderInProgress$ = new ReplaySubject(1);
        const nextRender$ = new ReplaySubject<() => Promise<any>>(1);

        combineLatest([
            renderInProgress$,
            nextRender$
        ]).subscribe(([renderInProgress, nextRender]) => {
            if (!renderInProgress && nextRender) {
                nextRender$.next(undefined);
                renderInProgress$.next(nextRender().then(() => renderInProgress$.next(undefined)))
            }
        })

        combineLatest(
            [
                this.currentBook$,
                this.currentCardMap$,
                this.currentSpineItem$
            ]
        ).subscribe(([bookInstance, cardLookup, spineItem]) => {
            const render = async () => {
                if (bookInstance && bookInstance.book && spineItem) {
                    let elementById = document.getElementById('book');
                    if (!elementById) {
                        throw new Error("Book element not found")
                    }
                    debugger;
                    elementById.textContent = '';
                    const rendition = bookInstance.book.renderTo(elementById, {width: 600, height: 400})
                    const target = spineItem.href;
                    await rendition.display(target);
                    if (cardLookup) {
                        this.annotateElements(target, cardLookup, (s: string) => this.renderMessages$.next(s));
                    }
                }
            }
            nextRender$.next(render);
        })
    }

    makeSimpleText(name: string, text: string) {
        this.bookLoadUpdates$.next({
            name,
            book: {
                renderTo(e: HTMLElement, options: { [p: string]: any }): aRendition {
                    return {
                        display: async s => {
                            let htmlElements = $(`<p style="white-space: pre">${text}</p>`);
                            // @ts-ignore
                            let target: JQuery<HTMLElement> = iframe.contents().find('body');
                            htmlElements.appendTo(target);
                        }
                    }
                },
                spine: {
                    each: cb => cb({href: ''})
                }
            },
            message: `Created simple text source ${name}`
        });
    }

    private annotateElements(
        target: string,
        c: Dictionary<ICard[]>,
        messageSender: (s: string) => void) {
        return new Promise((resolve, reject) => {
            let $iframe = $('iframe');
            messageSender(`Starting render`)
            let contents = $iframe.contents();
            let body = contents.find('body');
            const characters = body.text().normalize();
            /*
                    const t = new trie<number>();
                    let currentSection: string[] = [];
                    for (let i = 0; i < characters.length; i++) {
                        const char = characters[i];
                        if (isChineseCharacter(char)) {
                            if (currentSection.length >= CHAR_LIMIT) {
                                // Insert into the trie all characters
                                t.insert(currentSection.join(''), i)
                                currentSection.splice(currentSection.length - 1, 1) // TODO this deletes the last, right?
                            } else {
                                currentSection.push(char);
                            }
                        } else {
                            windDownStringIntoTrie(currentSection, t, i);
                            currentSection = [];
                        }
                    }
            */
            const root = $('<div/>');
            const popupElements: JQuery[] = [];
            let currentEl = $('<span/>');
            for (let i = 0; i < characters.length; i++) {
                const char = characters[i];
                const word = sify(char);
                const el = $('<span/>');
                el.text(word);
                if (isChineseCharacter(char)) {
                    popupElements.push(el);
                }
                root.append(el);
            }
            debugger;
            body.children().remove();
            body.append(root);
            setTimeout(() => {
                messageSender(`Mounting flashcards`)
                popupElements.forEach(e => {
                    let text = e.text();
                    let t = c[text];
                    if (t) {
                        e.addClass('hoverable')
                        let htmlElements = e.get(0);
                        render(<FlashcardPopup card={t[0]} text={text}
                                               getImages={async function (char: string): Promise<string[]> {
                                                   const o = await queryImages(char, 4)
                                                   return o.data.map(d => d.assets.preview.url);
                                               }}/>, htmlElements);
                    }
                })
                messageSender(`Finished Render`)
                debugger;
                resolve()
            })
            body.append(`
                    <style>
.hoverable {
  background-color: lightyellow;
}
.hoverable:hover {
  background-color: lightgreen;
}
</style>
                    `)
        })
    }

    receiveDebugMessage(o: any) {
        this.allMessages$.next(new DebugMessage(o.prefix, o.message))
    }

    async loadEbookInstance(path: string, name: string) {
        this.bookLoadUpdates$.next({
            name,
            book: undefined,
            message: `Loading ${name} from ${path}`
        });
        const book: Book = Epub(path);
        await book.ready
        this.bookLoadUpdates$.next({
            name,
            book,
            message: `Loaded ${name}`
        });
    }

    receiveSerializedPackage(s: SerializedAnkiPackage) {
        let cards = s.cards;
        if (cards?.length) {
            this.stringMessages.next(`Received package with ${cards?.length} cards`)
            this.addCard$.next(cards);
        }
        this.packageUpdate$.next(UnserializeAnkiPackage(s))
    }

    initIframeListeners() {
        combineLatest([this.renderRef$, this.textSource$, this.cardIndex$]).subscribe(([ref, text, cardIndex]) => {
            const iframe = this.getNewIframe(ref);
            this.applySelectListener(iframe);
            const frameBody = $(iframe).contents().find('body');
            frameBody.append(`<p>${text}</p>`);
        })
    }

    private getNewIframe(ref: HTMLElement): HTMLIFrameElement {
        this.stringMessages.next('Clearing children of renderRef')
        for (let i = 0; i < ref.children.length; i++) {
            ref.children[i].remove();
        }
        this.stringMessages.next('Appending new iframe')
        const iframe = $(` <iframe style="width: 100%; height: 100%; font-family: sans-serif"> </iframe>`);
        iframe.appendTo(ref);
        // @ts-ignore
        return iframe[0];
    }


    applySelectListener(iframe: HTMLIFrameElement) {
        if (!iframe.contentWindow) {
            throw new Error("Iframe has no content window");
        }
        const onMouseUp$ = fromEvent(iframe.contentWindow, 'mouseup');
        onMouseUp$.pipe(withLatestFrom(
            this.currentDeck$,
            this.currentCollection$,
            this.currentPackage$
        )).subscribe(([e, d, c, p]) => {
            if (!iframe.contentWindow) {
                throw new Error("Iframe has no content window");
            }
            const activeEl = iframe.contentWindow.document.activeElement;
            if (activeEl) {
                const selObj = iframe.contentWindow.document.getSelection();
                if (selObj) {
                    const text = selObj.toString();
                    this.selectionText$.next(text);
                    this.newCardRequest$.next({
                        deck: d?.name || "NO_DECK",
                        characters: text,
                        fields: [],
                        photos: [],
                        sounds: [],
                        english: [],
                        collection: c?.name || "NO_COLLECTION",
                        ankiPackage: p?.name || "NO_PACKAGE"
                    })
                }
            }
        })
    }
}