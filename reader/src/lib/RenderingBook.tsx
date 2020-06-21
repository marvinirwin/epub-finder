import {combineLatest, fromEvent, ReplaySubject, Subject} from "rxjs";
import {Dictionary, uniq, maxBy, uniqBy} from "lodash";
import {debounceTime, startWith, switchMap, withLatestFrom} from "rxjs/operators";
import {Manager, sleep} from "./Manager";
import $ from "jquery";
import {isChineseCharacter} from "./serializeable/worker-safe/Card";
import {render} from "react-dom";
import {FlashcardPopup} from "../components/FlashcardPopup";
import {queryImages} from "../AppSingleton";
import React from "react";
// @ts-ignore
import {sify} from 'chinese-conv';
import {ICard} from "./serializeable/worker-safe/icard";
import {cBookInstance} from "./cBookInstance";
import axios from 'axios';
import {LocalStorageManager} from "./StorageManagers";

import Trie from "trie-prefix-tree";

export interface BookInstance {
    message: string;
    name: string;
    serialize: (() => void) | undefined
}

export interface Trie {
    /**
     * Get a string representation of the trie
     */
    dump(spacer?: number): string;

    /**
     * Get the generated raw trie object
     */
    tree(): any;

    /**
     * Add a new word to the trie
     */
    addWord(word: string): ReturnType<typeof Trie>;

    /**
     * Remove an existing word from the trie
     */
    removeWord(word: string): ReturnType<typeof Trie>;

    /**
     * Check a prefix is valid
     * @returns Boolean
     */
    isPrefix(word: string): boolean;

    /**
     * Count the number of words with the given prefixSearch
     * @returns Number
     */
    countPrefix(word: string): number;

    /**
     * Get a list of all words in the trie with the given prefix
     * @returns Array
     */
    getPrefix(word: string, sort?: boolean): string[];

    /**
     * Get a random word in the trie with the given prefix
     * @returns Array
     */
    getRandomWordWithPrefix(prefix: string): string;

    /**
     * Get all words in the trie
     * @returns Array
     */
    getWords(sorted?: boolean): string[];

    /**
     * Check the existence of a word in the trie
     * @returns Boolean
     */
    hasWord(word: string): boolean;

    /**
     * Get a list of valid anagrams that can be made from the given letters
     * @returns Array
     */
    getAnagrams(word: string): string[];

    /**
     * Get a list of all sub-anagrams that can be made from the given letters
     * @returns Array
     */
    getSubAnagrams(word: string): string[];
}

function waitFor(f: () => any, n: number) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            let f1 = f();
            if (f1) {
                resolve();
                clearInterval(interval);
            }
        }, n);
    })

}

// Now let's start a window function over a string

interface IWordPos {
    word: string;
    position: number;
}

interface ITryChar {
    words: IWordPos[];
    char: string;
    el: JQuery<HTMLElement>
}

interface IWordInProgress {
    word: string;
    lengthRemaining: number;
}


// WHat is the shape of characters?
// Should be empty until
// The firstw ordInProgress should start at 23

export class RenderingBook {
    bookInstance$: Subject<cBookInstance> = new Subject<cBookInstance>()
    renderMessages$: ReplaySubject<string> = new ReplaySubject<string>();
    currentSpineItem$: ReplaySubject<aSpineItem | undefined> = new ReplaySubject(1);
    renderRef$: ReplaySubject<HTMLElement> = new ReplaySubject<HTMLElement>(1)
    renderInProgress$: ReplaySubject<any> = new ReplaySubject(1);
    nextRender$: ReplaySubject<() => Promise<any>> = new ReplaySubject<() => Promise<any>>(1);
    translationText$: ReplaySubject<string> = new ReplaySubject<string>(1)
    localStorageKey: any;
    persistor: LocalStorageManager;
    renderedContentRoot$: Subject<JQuery<HTMLElement>> = new Subject<JQuery<HTMLElement>>();

    removeSerialized() {
        this.persistor.delete((serialized: any) => serialized.name === this.name);
    }

    constructor(
        bookInstance: cBookInstance,
        public m: Manager,
        public name: string,
    ) {
        this.localStorageKey = bookInstance.localStorageKey;
        this.persistor = new LocalStorageManager(bookInstance.localStorageKey);
        this.bookInstance$.subscribe(instance => {
            this.persistor.upsert((serialized: any) => serialized.name === this.name, instance.toSerialized());
        });

        this.bookInstance$.pipe(switchMap(i => i.wordCountRecords$)).subscribe(r => this.m.addWordCountRows$.next(r))
        this.bookInstance$.pipe(switchMap(i => i.rawText$)).subscribe(r => {
            axios.post('/translate', {
                from: 'zh-CN',
                to: 'en',
                text: r
            }).then(r => {
                this.translationText$.next(r.data.translation);
            })
        })

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
        this.oRender();
        this.oAnnotate();
        this.bookInstance$.next(bookInstance);
        this.renderInProgress$.next(false);
        this.currentSpineItem$.next(undefined);
        // This will definitely be out of sync with the render, it has to fire right after the render method

    }

    private oAnnotate() {
        combineLatest([
            this.m.cardMap$.pipe(startWith({})),
            this.renderedContentRoot$,
            this.m.trieWrapper.changeSignal$.pipe(debounceTime(500))
        ]).subscribe(async ([cardMap, rootElement]) => {
            await this.annotate(rootElement, cardMap, this.m.trieWrapper.t);
        })
    }

    private oRender() {
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
                    await this.applySelectListener(iframe);
                    await waitFor(() => {
                        let contents = iframe.contents();
                        let htmlBodyElements = contents.find('body');
                        return htmlBodyElements.text().trim();
                    }, 1000)
                    this.renderedContentRoot$.next(iframe.contents().find('body'))
                    // @ts-ignore
                } else {
                    this.renderMessages$.next("No book or spine item")
                }
            }
            this.renderMessages$.next("Setting next render");
            this.nextRender$.next(render);
        });
    }

    private async annotate(body: JQuery<HTMLElement>, map: Dictionary<ICard[]>, trie: Trie) {
        /*
                const iframeHTML = iframeFromOtherSource[0].innerHTML;
                // Now delete that iframe
                iframeFromOtherSource.remove();
                // Now create a new IFrame
                const newIFrameWithNoSource = $(`<iframe></iframe>`);
                newIFrameWithNoSource.appendTo(ref);
                await sleep(500);
                const dstFrame: HTMLIFrameElement = newIFrameWithNoSource[0] as HTMLIFrameElement;
                var dstDoc = dstFrame.contentDocument;
                if (!dstDoc) {
                    throw new Error("No destination document");
                }
                dstDoc.write(iframeHTML);


                const body: HTMLBodyElement = newIFrameWithNoSource.contents().find('body')[0];
        */

        if (!body) {
            debugger;
            console.log();
        }

        if (!trie.getWords().length) return;
        const allEls = body[0].getElementsByTagName('*');
        for (let i = 0; i < allEls.length; i++) {
            const el = allEls[i];
            if (el.nodeType === Node.TEXT_NODE || (el.tagName === 'P'/* && el.children.length === 0*/)) {
                await this.annotateWithStuff($(el) as JQuery<HTMLElement>, trie, uniq(trie.getWords().map(w => w.length)));

                // Apply flashcards to it
/*                const newText: string[] = [];
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
                // Maybe I'm not allowed to add things to text nodes?  Maybe I have to use el.parent.append?*/
            }
        }
        const flashCards = body[0].getElementsByClassName('flashcard');
        for (let i = 0; i < flashCards.length; i++) {
            $(flashCards[i]).on('click', t => {
                if (t.target.textContent) {
                    this.m.requestEditWord$.next(t.target.textContent)
                }
                // this.m.cardInEditor$.next(EditingCard.fromICard(map[t.target.textContent || ''][0]));
            })
        }
        RenderingBook.appendStyleToBody(body);
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


    async annotateWithStuff(e: JQuery<HTMLElement>, t: Trie, uniqueLengths: number[]) {
        const text = e.text();
        e.empty();
        const characters: ITryChar[] = Array(text.length);
        let wordsInProgress: IWordInProgress[] = [];
// So now we have a trie lets compate the index of things in a string
        for (let i = 0; i < text.length; i++) {
            wordsInProgress = wordsInProgress.map(w => {
                w.lengthRemaining--;
                return w;
            }).filter(w => w.lengthRemaining > 0);
            const strings = uniqueLengths.map(size => text.substr(i, size));
            // @ts-ignore
            const wordsWhichStartHere: string[] = strings.map(str => t.hasWord(str) ? str : undefined).filter(s => s);
            wordsInProgress.push(...wordsWhichStartHere.map(word => ({word, lengthRemaining: word.length})))
            let words = wordsInProgress.map(({word, lengthRemaining}) => ({
                word,
                position: word.length - lengthRemaining
            }));
            let maxWord = maxBy(words, 'length');
            let el = $(`<mark >${text[i]}</mark>`);
            el.appendTo(e)
            let iTryChar = {
                char: text[i],
                words: words,
                word: maxWord,
                el: el
            };
            iTryChar.el.on("click", (ev) => {
                if (maxWord) {
                    e.children('.highlighted').removeClass('highlighted')
                    const elementsToHighlight = [];
                    const startIndex = i - maxWord.position;
                    for (let i = startIndex; i < startIndex + maxWord.word.length; i++) {
                        elementsToHighlight.push(characters[i].el);
                    }
                    elementsToHighlight.forEach(e => e.addClass('highlighted'))
                    this.m.requestEditWord$.next(maxWord.word);
                }
            })
            characters[i] = iTryChar;
        }
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
            RenderingBook.appendStyleToBody(body);
            root.appendTo(body)
            resolve()
        })
    }

    private static appendStyleToBody(body: JQuery<HTMLElement>) {
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
            this.m.currentPackage$,
            this.m.cardMap$
        )).subscribe(([e, currentDeck, currentCollection, currentPackage, cardMap]) => {
            if (!contentWindow) {
                throw new Error("Iframe has no content window");
            }
            const activeEl = contentWindow.document.activeElement;
            if (activeEl) {
                const selObj = contentWindow.document.getSelection();
                if (selObj) {
                    const text = selObj.toString();
                    this.m.selectionText$.next(text);
                    const c = RenderingBook.getExistingCard(cardMap, text);
                    this.m.newCardRequest$.next({
                        deck: currentDeck?.name || "NO_DECK",
                        learningLanguage: text,
                        fields: [],
                        photos: [],
                        sounds: [],
                        knownLanguage: [],
                        collection: currentCollection?.name || "NO_COLLECTION",
                        ankiPackage: currentPackage?.name || "NO_PACKAGE",
                        illustrationPhotos: [],
                        timestamp: c?.timestamp || new Date()
                    })
                }
            }
        })
    }

    private static getExistingCard(cardMap: Dictionary<ICard[]>, text: string): ICard | undefined {
        return cardMap[text] ? cardMap[text][0] : undefined;
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



