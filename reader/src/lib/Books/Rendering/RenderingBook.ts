import {combineLatest, fromEvent, ReplaySubject, Subject} from "rxjs";
import {Dictionary, uniq} from "lodash";
import {concatMap, debounceTime, filter, map, mapTo, skip, startWith, switchMap, withLatestFrom} from "rxjs/operators";
import {getNewICardForWord, Manager, sleep} from "../../Manager";
import $ from "jquery";
// @ts-ignore
import {ICard} from "../../Interfaces/ICard";
import {LocalStorageManager} from "../../Storage/StorageManagers";
import {aSpineItem} from "../../Interfaces/Book/aSpineItem";
import {BookInstance} from "../BookInstance";
import {AnnotatedElement} from "./AnnotatedElement";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {isChineseCharacter} from "../../Interfaces/OldAnkiClasses/Card";


export function mergeAnnotationDictionary(cDict: Dictionary<IAnnotatedCharacter[]>, acc: Dictionary<IAnnotatedCharacter[]>) {
    Object.entries(cDict).forEach(([word, annotatedCharacters]) => {
        if (acc[word]) {
            acc[word].push(...annotatedCharacters);
        } else {
            acc[word] = annotatedCharacters;
        }
    })
}


function getIndexOfEl(textNode: Element): number {
    for (var indexOfMe = 0; (textNode = <Element>textNode.previousSibling); indexOfMe++) ;
    return indexOfMe;
}

export class RenderingBook {
    bookInstance$: ReplaySubject<BookInstance> = new ReplaySubject<BookInstance>(1)
    renderMessages$: ReplaySubject<string> = new ReplaySubject<string>();
    currentSpineItem$: ReplaySubject<aSpineItem | undefined> = new ReplaySubject(1);
    renderRef$: ReplaySubject<HTMLElement> = new ReplaySubject<HTMLElement>(1)
    renderInProgress$: ReplaySubject<any> = new ReplaySubject(1);
    nextRender$: ReplaySubject<() => Promise<any>> = new ReplaySubject<() => Promise<any>>(1);
    translationText$: ReplaySubject<string> = new ReplaySubject<string>(1)
    localStorageKey: any;
    persistor: LocalStorageManager;
    renderedContentBody$: Subject<JQuery<HTMLElement>> = new Subject<JQuery<HTMLElement>>();
    leaves$: Subject<AnnotatedElement[]> = new Subject<AnnotatedElement[]>();

    annotatedCharMap$ = new ReplaySubject<Dictionary<IAnnotatedCharacter[]>>(1)
    currentTranslateText$ = new Subject<string>();

    isRendering$ = new ReplaySubject<boolean>(1);

    private static appendStyleToBody(body: JQuery<HTMLElement>) {
        let style = $(`
                    <style>
body {
zoom: 200%;
}
mark:hover {
  cursor: pointer;
}

.annotated_and_translated {
    transition-duration: 0.5s;
}
.annotated_and_translated:hover {
    background-color: #eaeaea;
}

mark {
    transition-duration: 0.5s;
    background-color: transparent;
}
.highlighted {
    background-color: lightgrey;
    font-weight: bold;
}

</style>
                    `);
        style.appendTo(body);
    }

    private static getExistingCard(cardMap: Dictionary<ICard[]>, text: string): ICard | undefined {
        return cardMap[text] ? cardMap[text][0] : undefined;
    }

    constructor(
        bookInstance: BookInstance,
        public m: Manager,
        public name: string,
    ) {

        this.isRendering$.next(true);

        this.localStorageKey = bookInstance.localStorageKey;
        this.persistor = new LocalStorageManager(bookInstance.localStorageKey);
        this.bookInstance$.subscribe(instance => {
            this.persistor.upsert((serialized: any) => serialized.name === this.name, instance.toSerialized());
        });

        this.bookInstance$.pipe(switchMap(i => i.wordCountRecords$)).subscribe(r => this.m.addWordCountRows$.next(r))

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

    public getId() {
        return `render_parent_${this.name}`
    }

    public removeSerialized() {
        this.persistor.delete((serialized: any) => serialized.name === this.name);
    }

    private oAnnotate() {
        this.renderedContentBody$.pipe(map($r => {
            return this.getLeaves($r);

        }))
            .subscribe(async (leafPromise: Promise<AnnotatedElement[]>) => {
                this.isRendering$.next(true)
                this.leaves$.next(await leafPromise);

            })

        combineLatest([
            this.leaves$,
            this.m.cardManager.trie.changeSignal$.pipe(debounceTime(500))
        ]).subscribe(async ([leaves]) => {

            let uniqueLengths = uniq(this.m.cardManager.trie.t.getWords().map(w => w.length));
            this.renderInProgress$.next(true);
            const chars: Dictionary<IAnnotatedCharacter[]>[] = [];
            for (let i = 0; i < leaves.length; i++) {
                const leaf = leaves[i];
                chars.push(leaf.annotate(this.m.cardManager.trie.t, uniqueLengths))
                await sleep(1);
            }

            const reducedChars = chars.reduce((
                acc: Dictionary<IAnnotatedCharacter[]>,
                cDict: Dictionary<IAnnotatedCharacter[]>) => {
                mergeAnnotationDictionary(cDict, acc);
                return acc;
            }, {})
            this.annotatedCharMap$.next(reducedChars);

            this.renderInProgress$.next(false);
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
                    this.renderMessages$.next("Waiting for iframe 500ms")
                    await sleep(500);
                    // @ts-ignore
                    const rendition = bookInstance.book.renderTo(iframe, {width: 600, height: 400})
                    const target = spineItem?.href;
                    await rendition.display(target || '');
                    await this.applySelectListener(iframe);
                    let body = iframe.contents().find('body');
                    await sleep(500);
                    this.m.applyGlobalListener(body as unknown as HTMLElement);
                    this.renderedContentBody$.next(body)
                    // @ts-ignore
                } else {
                    this.renderMessages$.next("No book or spine item")
                }
            }
            this.renderMessages$.next("Setting next render");
            this.nextRender$.next(render);
        });
    }

    private applySelectListener(iframe: JQuery<HTMLIFrameElement>) {
        let contentWindow = iframe[0].contentWindow;
        if (!contentWindow) {
            return;
            throw new Error("Iframe has no content window");

        }
        const onMouseUp$ = fromEvent(contentWindow, 'mouseup');
        onMouseUp$.pipe(withLatestFrom(
            this.m.currentDeck$.pipe(startWith(undefined)),
            this.m.currentCollection$.pipe(startWith(undefined)),
            this.m.currentPackage$.pipe(startWith(undefined)),
            this.m.cardManager.cardIndex$
            ),// For some reason this fires twice always?
            debounceTime(100)).subscribe(([e, currentDeck, currentCollection, currentPackage, cardMap]) => {
            if (!contentWindow) {
                return;
                throw new Error("Iframe has no content window");
            }
            const activeEl = contentWindow.document.activeElement;
            if (activeEl) {
                const selObj = contentWindow.document.getSelection();
                if (selObj) {
                    const text = selObj.toString();
                    if (text) {
                        this.m.selectionText$.next(text);
                        this.m.requestEditWord$.next(text);
                    }
                    return;
                }
            }
        })
    }

    private async getLeaves(body: JQuery<HTMLElement>): Promise<AnnotatedElement[]> {
        const leaves = RenderingBook.getTextElements(body);
        const ret = [];
        for (let i = 0; i < leaves.length; i++) {
            const textNode = leaves[i];
            const parent: HTMLElement = <HTMLElement>textNode.parentElement;
            const myText: string = <string>textNode.textContent;
            const indexOfMe = getIndexOfEl(textNode);
            textNode.remove();
            const div = document.createElement('SPAN');
            div.textContent = myText;
            parent.insertBefore(div, parent.children[indexOfMe]);
            await sleep(1);
            ret.push(new AnnotatedElement(this, $(div) as JQuery<HTMLElement>));
        }
        RenderingBook.appendStyleToBody(body);


        return ret;
        /*
                const flashCards = body[0].getElementsByClassName('flashcard');
                for (let i = 0; i < flashCards.length; i++) {
                    $(flashCards[i]).on('click', t => {
                        if (t.target.textContent) {
                            this.m.requestEditWord$.next(t.target.textContent)
                        }
                        // this.m.cardInEditor$.next(ReactiveClasses.fromICard(map[t.target.textContent || ''][0]));
                    })
                }
        */
    }
    public static removeElementEffects(body: JQuery<HTMLElement>) {
        // body.find('*').off('click mouseenter mouseleave')
    }

    public static getTextElements(body: JQuery<HTMLElement>) {
        const leaves: Element[] = [];
        var walker = document.createTreeWalker(
            body[0],
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        var node;
        var textNodes = [];

        while(node = walker.nextNode()) {
            let trim = node.textContent?.trim();
            if (trim) {
                leaves.push(node as Element);
            }
        }
/*
        const allEls = body[0].getElementsByTagName('*');


        for (let i = 0; i < allEls.length; i++) {
            const el = allEls[i];
            for (let j = 0; j < el.children.length; j++) {
                const child = el.children[j];
                if (child.nodeType === Node.TEXT_NODE /!*|| el.tagName === 'P'*!//!* || el.tagName === "SPAN" || el.tagName === "DIV"*!/) {
                    leaves.push(child)
                }
            }
        }
*/
        return leaves;
    }

    private async resolveIFrame(ref: HTMLElement): Promise<JQuery<HTMLIFrameElement>> {
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

}

export function waitFor(f: () => any, n: number) {
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

