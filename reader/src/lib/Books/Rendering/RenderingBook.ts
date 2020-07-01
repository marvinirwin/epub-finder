import {combineLatest, fromEvent, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary, uniq} from "lodash";
import {debounceTime, flatMap, startWith, withLatestFrom, map} from "rxjs/operators";
import {Manager, sleep} from "../../Manager";
// @ts-ignore
import {ICard} from "../../Interfaces/ICard";
import {LocalStorageManager} from "../../Storage/StorageManagers";
import {aSpineItem} from "../../Interfaces/Book/aSpineItem";
import {BookInstance} from "../BookInstance";
import {AnnotatedElement} from "./AnnotatedElement";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {mergeAnnotationDictionary} from "../../Util/mergeAnnotationDictionary";
import getTextElements from "./DocumentPreprocessing";
import {ANNOTATE_AND_TRANSLATE} from "./ReaderDocument";
import {printExecTime} from "../../Util/Timer";


export class RenderingBook {
    renderMessages$: ReplaySubject<string> = new ReplaySubject<string>();
    currentSpineItem$: ReplaySubject<aSpineItem | undefined> = new ReplaySubject(1);
    renderRef$: ReplaySubject<HTMLElement> = new ReplaySubject<HTMLElement>(1)
    renderInProgress$: ReplaySubject<any> = new ReplaySubject(1);
    nextRender$: ReplaySubject<() => Promise<any>> = new ReplaySubject<() => Promise<any>>(1);
    translationText$: ReplaySubject<string> = new ReplaySubject<string>(1)
    localStorageKey: any;
    persistor: LocalStorageManager;
    renderedContentBody$: Subject<JQuery<HTMLElement>> = new Subject<JQuery<HTMLElement>>();
    leaves$!: Observable<AnnotatedElement[]>;

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
        public bookInstance: BookInstance,
        public m: Manager,
        public name: string,
    ) {

        this.isRendering$.next(true);

        this.localStorageKey = bookInstance.localStorageKey;
        this.persistor = new LocalStorageManager(bookInstance.localStorageKey);

        this.bookInstance.wordCountRecords$.subscribe(r => this.m.addWordCountRows$.next(r))

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
        // This might take long, I should time this
        this.leaves$ = this.renderedContentBody$.pipe(map($r => {
            this.isRendering$.next(true)
            const t1 = performance.now();
            const leaves = this.rehydrate($r[0].ownerDocument as HTMLDocument);
            const t2 = performance.now();
            console.log(`It took ${t2 - t1} to rehydrate`)
            this.m.applyGlobalListener($r[0]);
            return leaves;
        }))

        combineLatest([
            this.leaves$,
            this.m.cardManager.trie.changeSignal$.pipe(debounceTime(500))
        ]).subscribe(async ([leaves]) => {
            printExecTime("Update words in annotated elements", () => {
                let uniqueLengths = uniq(this.m.cardManager.trie.t.getWords().map(w => w.length));
                this.renderInProgress$.next(true);
                const chars: Dictionary<IAnnotatedCharacter[]>[] = [];
                for (let i = 0; i < leaves.length; i++) {
                    const leaf = leaves[i];
                    chars.push(leaf.updateWords(this.m.cardManager.trie.t, uniqueLengths))
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
        })
    }

    private oRender() {
        combineLatest(
            [
                this.currentSpineItem$,
                this.renderRef$
            ]
        ).subscribe(([spineItem, renderRef]) => {
            const render = async () => {
                this.renderMessages$.next("Render fired")
                this.renderMessages$.next("Book present, rendering")
                const iframe = await this.resolveIFrame(renderRef);
                this.renderMessages$.next("Waiting for iframe 500ms")
                await sleep(500);
                // @ts-ignore
                const rendition = bookInstance..book.renderTo(iframe, {width: 600, height: 400})
                const target = spineItem?.href;
                await rendition.display(target || '');
                await this.applySelectionListener(iframe);
                let body = iframe.contents().find('body');
                await sleep(500);
                this.renderedContentBody$.next(body)
                // @ts-ignore
            }
            this.renderMessages$.next("Setting next render");
            this.nextRender$.next(render);
        });
    }

    private applySelectionListener(iframe: JQuery<HTMLIFrameElement>) {
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
            ),
            debounceTime(100)
        ).subscribe(([e, currentDeck, currentCollection, currentPackage, cardMap]) => {
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
        const leaves = getTextElements(body);
        RenderingBook.appendStyleToBody(body);


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
            this.applySelectionListener(iframe as JQuery<HTMLIFrameElement>);
            this.m.applyGlobalListener(iframe[0])
            this.m.applyShiftListener(iframe[0])
        }
        return iframe;
    }

    public rehydrate(htmlDocument: HTMLDocument): AnnotatedElement[] {
        const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
        const annotatedElements = new Array(elements.length);
        for (let i = 0; i < elements.length; i++) {
            const annotatedElement = elements[i];
            annotatedElements[i] = new AnnotatedElement(this, annotatedElement as HTMLElement);
        }
        return annotatedElements;
    }
}

