import {BehaviorSubject, combineLatest, fromEvent, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {map, share, withLatestFrom} from "rxjs/operators";
import Epub from 'epubjs';
import Spine from "epubjs/types/spine";
import Book from "epubjs/types/book";
import {Manager, sleep} from "./Manager";
import $ from "jquery";
import {ICard} from "../AppDB";
import {isChineseCharacter} from "../lib/worker-safe/Card";
import {render} from "react-dom";
import {FlashcardPopup} from "../components/FlashcardPopup";
import {queryImages} from "../AppSingleton";
import React from "react";
// @ts-ignore
import {sify} from 'chinese-conv';

export interface BookInstance {
    message: string;
    name: string;
    book: aBook | undefined;
}

export class RenderingBook {
    bookInstance$: Subject<BookInstance> = new Subject<BookInstance>()
    renderMessages$: ReplaySubject<string> = new ReplaySubject<string>();
    currentSpineItem$: ReplaySubject<aSpineItem | undefined> = new ReplaySubject(1);
    renderRef$: ReplaySubject<HTMLElement> = new ReplaySubject<HTMLElement>(1)
    renderInProgress$: ReplaySubject<any> = new ReplaySubject(1);
    nextRender$: ReplaySubject<() => Promise<any>> = new ReplaySubject<() => Promise<any>>(1);

    constructor(
        bookInstance: BookInstance,
        public m: Manager,
        public name: string
    ) {
        combineLatest([
            this.renderInProgress$,
            this.nextRender$
        ]).subscribe(([renderInProgress, nextRender]) => {
            this.renderMessages$.next(`deciding whether to execute another render`);
            if (!renderInProgress && nextRender) {
                this.renderMessages$.next(`No render in progress and a next render queued`);
                this.nextRender$.next(undefined);
                this.renderInProgress$.next(nextRender().then(() => this.renderInProgress$.next(undefined)))
            }
        })

        combineLatest(
            [
                this.bookInstance$,
                this.currentSpineItem$,
                this.renderRef$,
                this.m.currentCardMap$
            ]
        ).subscribe(([bookInstance, spineItem, renderRef, cardIndex]) => {
            debugger;
            const render = async () => {
                this.renderMessages$.next("Render fired")
                if (bookInstance && bookInstance.book && spineItem) {
                    this.renderMessages$.next("Book and spineItem present, rendering")
                    const iframe = this.getNewIframe(renderRef);
                    await sleep(1000);
                    let body = iframe.contents().find("body");
                    // @ts-ignore
                    const rendition = bookInstance.book.renderTo(body[0] as HTMLElement, {width: 600, height: 400})
                    const target = spineItem.href;
                    await rendition.display(target);
                    // @ts-ignore
                    if (cardIndex) {
                        this.renderMessages$.next("Annotating")
                        this.annotateInside(body, cardIndex, (s: string) => this.renderMessages$.next(s));
                    }
                } else {
                    this.renderMessages$.next("No book or spine item")
                }
            }
            this.renderMessages$.next("Setting next render");
            this.nextRender$.next(render);
        })

        this.bookInstance$.next(bookInstance);
        this.renderInProgress$.next(false);
        this.currentSpineItem$.next(undefined);
    }

    getNewIframe(ref: HTMLElement): JQuery<HTMLIFrameElement> {
        this.renderMessages$.next('Clearing children of renderRef')
        for (let i = 0; i < ref.children.length; i++) {
            ref.children[i].remove();
        }
        this.renderMessages$.next('Appending new iframe')
        const iframe: JQuery<HTMLIFrameElement> = $(` <iframe style="width: 100%; height: 100%; font-family: sans-serif"> </iframe>`);
        iframe.appendTo(ref);
        this.applySelectListener(iframe as JQuery<HTMLIFrameElement>);
        // @ts-ignore
        return iframe;
    }

    private annotateInside(
        body: JQuery<HTMLBodyElement>,
        c: Dictionary<ICard[]>,
        messageSender: (s: string) => void) {
        return new Promise((resolve, reject) => {
            messageSender(`Starting annotation`);
            const characters = body.text().normalize();
            messageSender(`Current text ${characters}`)
            messageSender("Removing children");
            body.children().remove();
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
            messageSender(`Mounting flashcards`)
            popupElements.forEach(e => {
                let text = e.text();
                let t = c[text];
                if (t) {
                    e.addClass('hoverable')
                    let htmlElements = e.get(0);
                    render(<FlashcardPopup
                        card={t[0]}
                        text={text}
                        getImages={async function (char: string): Promise<string[]> {
                            const o = await queryImages(char, 4)
                            return o.data.map(d => d.assets.preview.url);
                        }}/>, htmlElements);
                }
            })
            let style = $(`
                    <style>
.hoverable {
  background-color: lightyellow;
}
.hoverable:hover {
  background-color: lightgreen;
}
</style>
                    `);
            root.appendTo(body)
            style.appendTo(body);
            resolve()
        })
    }

    applySelectListener(iframe: JQuery<HTMLIFrameElement>) {
        let contentWindow = iframe[0].contentWindow;
        if (!contentWindow) {
            throw new Error("Iframe has no content window");
        }
        const onMouseUp$ = fromEvent(contentWindow, 'mouseup');
        onMouseUp$.pipe(withLatestFrom(
            this.m.currentDeck$,
            this.m.currentCollection$,
            this.m.currentPackage$
        )).subscribe(([e, d, c, p]) => {
            if (!contentWindow) {
                throw new Error("Iframe has no content window");
            }
            const activeEl = contentWindow.document.activeElement;
            if (activeEl) {
                const selObj = contentWindow.document.getSelection();
                if (selObj) {
                    const text = selObj.toString();
                    this.m.selectionText$.next(text);
                    this.m.newCardRequest$.next({
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

export interface aBook {
    renderTo(e: HTMLElement, options: { [key: string]: any }): aRendition

    spine: aSpine;
}

export interface aRendition {
    display: (e: string) => Promise<any>;
}

export interface aSpine {
    each(...args: any[]): any;
}

export interface aSpineItem {
    href: string;
}



