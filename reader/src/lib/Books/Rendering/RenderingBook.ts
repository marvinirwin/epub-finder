import {combineLatest, fromEvent, ReplaySubject, Subject} from "rxjs";
import {Dictionary, uniq} from "lodash";
import {debounceTime, map, switchMap, withLatestFrom} from "rxjs/operators";
import {Manager, sleep} from "../../Manager";
import $ from "jquery";
// @ts-ignore
import {ICard} from "../../Interfaces/ICard";
import axios from 'axios';
import {LocalStorageManager} from "../../Storage/StorageManagers";
import {aSpineItem} from "../../Interfaces/Book/aSpineItem";
import {BookInstance} from "../BookInstance";
import {AnnotatedElement} from "./AnnotatedElement";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";


export function mergeAnnotationDictionary(cDict: Dictionary<IAnnotatedCharacter[]>, acc: Dictionary<IAnnotatedCharacter[]>) {
    Object.entries(cDict).forEach(([word, annotatedCharacters]) => {
        if (acc[word]) {
            acc[word].push(...annotatedCharacters);
        } else {
            acc[word] = annotatedCharacters;
        }
    })
}


export class RenderingBook {
    bookInstance$: Subject<BookInstance> = new Subject<BookInstance>()
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

    private static appendStyleToBody(body: JQuery<HTMLElement>) {
        let style = $(`
                    <style>
mark:hover {
  cursor: pointer;
}
mark {
    transition-duration: 0.5s;
    background-color: transparent;
}
.highlighted {
    background-color: grey;
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

    public getId() {
        return `render_parent_${this.name}`
    }

    public removeSerialized() {
        this.persistor.delete((serialized: any) => serialized.name === this.name);
    }

    private oAnnotate() {
        this.renderedContentBody$.pipe(map($r => this.getLeaves($r)))
            .subscribe(async (leafPromise: Promise<AnnotatedElement[]>) => {
                this.leaves$.next(await leafPromise);
            })

        combineLatest([
            this.leaves$,
            this.m.trieWrapper.changeSignal$.pipe(debounceTime(500))
        ]).subscribe(async ([leaves]) => {

            const chars: Dictionary<IAnnotatedCharacter[]>[] = leaves.map(l => l.annotate(
                this.m.trieWrapper.t,
                uniq(this.m.trieWrapper.t.getWords().map(w => w.length))
            ));
            const reducedChars = chars.reduce((
                acc: Dictionary<IAnnotatedCharacter[]>,
                cDict: Dictionary<IAnnotatedCharacter[]>) => {
                mergeAnnotationDictionary(cDict, acc);
                return acc;
            }, {})
            this.annotatedCharMap$.next(reducedChars);
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
                    await waitFor(() => {
                        let contents = iframe.contents();
                        return contents.find('body');
                    }, 250)
                    // @ts-ignore
                    const rendition = bookInstance.book.renderTo(iframe, {width: 600, height: 400})
                    const target = spineItem?.href;
                    await rendition.display(target || '');
                    await this.applySelectListener(iframe);
                    let body = iframe.contents().find('body');
                    RenderingBook.appendStyleToBody(body)
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

    private async getLeaves(body: JQuery<HTMLElement>): Promise<AnnotatedElement[]> {
        const leaves = [];
        const allEls = body[0].getElementsByTagName('*');
        for (let i = 0; i < allEls.length; i++) {
            const el = allEls[i];
            if (el.nodeType === Node.TEXT_NODE || (el.tagName === 'P'/* && el.children.length === 0*/)) {
                leaves.push(new AnnotatedElement(this, $(el) as JQuery<HTMLElement>))
            }
        }
        return leaves;
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

