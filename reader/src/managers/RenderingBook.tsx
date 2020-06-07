import {combineLatest, fromEvent, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {startWith, withLatestFrom} from "rxjs/operators";
import {ISimpleText, Manager, sleep} from "./Manager";
import $ from "jquery";
import {isChineseCharacter} from "../lib/worker-safe/Card";
import {render} from "react-dom";
import {FlashcardPopup} from "../components/FlashcardPopup";
import {EditingCard, queryImages} from "../AppSingleton";
import React from "react";
// @ts-ignore
import {sify} from 'chinese-conv';
import {ICard} from "../lib/worker-safe/icard";

export interface BookInstance {
    message: string;
    name: string;
    serialize: (() => void) | undefined
}

export abstract class cBookInstance {
    localStorageKey!: string;
    book: aBook | undefined;
    constructor(public name: string) {}
    abstract getSerializedForm(): {[key: string]: any}
    abstract createFromSerilizedForm(o: string): cBookInstance[]
}



export class Tweet extends cBookInstance {
    localStorageKey = "TWEET"
    constructor(name: string, public url: string) {
        super(name);
        this.book = {
            renderTo(iframe: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): aRendition {
                return {
                    display: async spineItem => {
                        // e is an iframe
                        iframe.attr('src', url);
                        // Now wait a bit for the tweet to render
                        await sleep(1000);
                    }
                }
            },
            spine: {
                each: cb => cb({href: ''})
            }
        };
    }

    getSerializedForm() {
        return {
            [this.name]: {
                name: this.name,
                url: this.url
            }
        }
    }

    createFromSerilizedForm(o: string): Tweet[] {
        const v = JSON.parse(o || '') || {};
        if (!Array.isArray(v)) {
            // @ts-ignore
            return Object.values(v).filter(({name, url}) => name && url).map(({name, url}: {name: string, url: string}) => new Tweet(name, url))
        }
        return []
    }
}

export class SimpleText extends cBookInstance {
    localStorageKey = "SIMPLE_TEXT"
    constructor(name: string, public text: string) {
        super(name);
        this.book = {
            renderTo(e: JQuery<HTMLIFrameElement>, options: { [p: string]: any }): aRendition {
                return {
                    display: async spineItem => {
                        let htmlElements = $(`<p style="white-space: pre">${text}</p>`);
                        let target: JQuery<HTMLElement> = e.contents().find('body');
                        htmlElements.appendTo(target);
                    }
                }
            },
            spine: {
                each: cb => cb({href: ''})
            }
        };
    }

    getSerializedForm() {
        return {
            [this.name]: {
                name: this.name,
                text: this.text
            }
        }
    }

    createFromSerilizedForm(o: string): SimpleText[] {
        const v = JSON.parse(o || '') || {};
        if (!Array.isArray(v)) {
            // @ts-ignore
            return Object.values(v).filter(({name, text}) => name && text).map(({name, text}: {name: string, text: string}) => new SimpleText(name, text))
        }
        return []
    }
}

export class RenderingBook {
    bookInstance$: Subject<cBookInstance> = new Subject<cBookInstance>()
    renderMessages$: ReplaySubject<string> = new ReplaySubject<string>();
    currentSpineItem$: ReplaySubject<aSpineItem | undefined> = new ReplaySubject(1);
    renderRef$: ReplaySubject<HTMLElement> = new ReplaySubject<HTMLElement>(1)
    renderInProgress$: ReplaySubject<any> = new ReplaySubject(1);
    nextRender$: ReplaySubject<() => Promise<any>> = new ReplaySubject<() => Promise<any>>(1);
    type: any;


    constructor(
        bookInstance: cBookInstance,
        public m: Manager,
        public name: string

    ) {
        this.type = bookInstance.localStorageKey;
        this.bookInstance$.subscribe(instance => {
            const str = localStorage.getItem(instance.localStorageKey);
            let currentObject;
            if (str) {
                currentObject = JSON.parse(str);
                if (typeof str !== 'object'  ||Array.isArray(currentObject)) {
                    currentObject = {};
                }
            } else {
                currentObject = {};
            }
            const o = Object.assign(currentObject, instance.getSerializedForm());
            localStorage.setItem(instance.localStorageKey, JSON.stringify(o))
        });

        Object.entries(this).forEach(([key, value]) => {
            if (value !== this.renderMessages$) {
                if (value && value.subscribe) {
                    // @ts-ignore
                    value.subscribe(newValue => {
                        this.renderMessages$.next(`${key} updated to ${newValue}`)
                    })
                }
            }
        })

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
                this.renderRef$
            ]
        ).subscribe(([bookInstance, spineItem, renderRef]) => {
            const render = async () => {
                this.renderMessages$.next("Render fired")
                if (bookInstance && bookInstance.book) {
                    this.renderMessages$.next("Book present, rendering")
                    const iframe = await this.resolveIFrame(renderRef);
                    this.renderMessages$.next("Waiting for iframe 250ms")
                    await sleep(1000);
                    // @ts-ignore
                    const rendition = bookInstance.book.renderTo(iframe, {width: 600, height: 400})
                    const target = spineItem?.href;
                    await rendition.display(target || '');
                    this.applySelectListener(iframe);
                    // @ts-ignore
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
        this.m.currentCardMap$.pipe(withLatestFrom(this.renderRef$.pipe(startWith({})))).subscribe(([map, ref]) => {
            // Go into the iframe, remove all the marks with my class
            // Go through each element of the iframe body and get the text inside
            // The element I'm getting text from
            debugger;
            const body: HTMLBodyElement = $(ref).find('iframe').contents().find('body')[0];
            const allEls = body.getElementsByTagName('*');
            const textEls = [];
            for (let i = 0; i < allEls.length; i++) {
                const el = allEls[i];
                if(el.nodeType === Node.TEXT_NODE || (el.tagName === 'P'/* && el.children.length === 0*/)) {
                    // Apply flashcards to it
                    const newText: string[] = [];
                    const text = (el.textContent || '').split('') // maybe innerHTML?;
                    text.forEach((c, i) => {
                        const flashCard = map[c];
                        if (!flashCard) {
                            newText.push(c)
                        } else {
                            // Now make a mark on top
                            newText.push(`<mark class="flashcard">${c}</mark>`)
                        }
                    })
                    el.innerHTML = newText.join('')// weird how I get textContent but set innerHTML
                    // Maybe I'm not allowed to add things to text nodes?  Maybe I have to use el.parent.append?
                }
            }
            const flashCards = body.getElementsByClassName('flashcard');
            for (let i = 0; i < flashCards.length; i++) {
                $(flashCards[i]).on('click', t => {
                    this.m.cardInEditor$.next(EditingCard.fromICard(map[t.target.textContent || ''][0]));
                })
            }
            this.appendStyoeToBody($(body));
        })
    }

    getId() {
        return `render_parent_${this.name}`
    }

    async resolveIFrame(ref: HTMLElement): Promise<JQuery<HTMLIFrameElement>> {
        this.renderMessages$.next('Clearing children of renderRef')
        for (let i = 0; i < ref.children.length; i++) {
            ref.children[i].remove();
        }
        this.renderMessages$.next('Appending new iframe')
        let iframe: JQuery<HTMLIFrameElement> = $(`#${this.getId()}`).find('iframe');
        if (iframe.length) {
            iframe.contents().find('body').children().remove();
        } else {
            iframe = $(` <iframe style="border: none; width: 100%; height: 100%; font-family: sans-serif"> </iframe>`);
            iframe.appendTo(ref);
            await sleep(500);
            // Maybe do this after?
            this.applySelectListener(iframe as JQuery<HTMLIFrameElement>);
        }
        return iframe;
    }

    private annotateInside(
        iframe: JQuery<HTMLIFrameElement>,
        c: Dictionary<ICard[]>,
        messageSender: (s: string) => void) {
        return new Promise((resolve, reject) => {
            const body = iframe.contents().find('body');
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
                        m={this.m}
                        card={t[0]}
                        text={text}
                        getImages={async function (char: string): Promise<string[]> {
                            const o = await queryImages(char, 4)
                            return o.data.map(d => d.assets.preview.url);
                        }}/>, htmlElements);
                }
            })
            this.appendStyoeToBody(body);
            root.appendTo(body)
            resolve()
        })
    }

    private appendStyoeToBody(body: JQuery<HTMLBodyElement>) {
        let style = $(`
                    <style>
.flashcard:hover {
  cursor: pointer;
}
</style>
                    `);
        style.appendTo(body);
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
    renderTo(e: JQuery<HTMLIFrameElement>, options: { [key: string]: any }): aRendition

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



