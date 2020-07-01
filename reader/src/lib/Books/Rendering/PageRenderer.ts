import {combineLatest, fromEvent, Observable, ReplaySubject, Subject} from "rxjs";
import $ from 'jquery';
import {Dictionary, uniq} from "lodash";
import {debounceTime, flatMap, map, startWith, withLatestFrom} from "rxjs/operators";
import {Manager, sleep} from "../../Manager";
import {AnnotatedElement} from "./AnnotatedElement";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {mergeWordTextNodeMap} from "../../Util/mergeAnnotationDictionary";
import {ANNOTATE_AND_TRANSLATE} from "./ReaderDocument";
import {printExecTime} from "../../Util/Timer";
import {waitFor} from "../../Util/waitFor";
import {isChineseCharacter} from "../../Interfaces/OldAnkiClasses/Card";
import {IWordCountRow} from "../../Interfaces/IWordCountRow";


// TODO divorce the renderer from the counter/analyzer
export class PageRenderer {
    ref$ = new ReplaySubject<HTMLElement>();
    textNodes$!: Observable<AnnotatedElement[]>;
    wordTextNodeMap$ = new ReplaySubject<Dictionary<IAnnotatedCharacter[]>>(1);
    text$ = new Subject<string>();
    wordCountRecords$ = new Subject<IWordCountRow[]>();

    private static appendAnnotationStyleToPageBody(body: HTMLElement) {
        let style = $(`
                    <style>
mark:hover {
  cursor: pointer;
}

body {
}
.POPPER_ELEMENT {
    background-color: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 13px;
    display: none;
}

.POPPER_ELEMENT[data-show] {
    display: block;
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

    constructor(
        public src: string,
        public m: Manager,
        public name: string,
    ) {
        this.text$.subscribe(text => {
            const countedCharacters: Dictionary<number> = text
                .split('')
                .filter(isChineseCharacter)
                .reduce((acc: Dictionary<number>, letter) => {
                    if (!acc[letter]) {
                        acc[letter] = 1;
                    } else {
                        acc[letter]++;
                    }
                    return acc;
                }, {});

            this.wordCountRecords$.next(
                Object.entries(countedCharacters).map(([letter, count]) => ({
                    book: this.name,
                    word: letter,
                    count
                }))
            )
        })

        this.textNodes$ = this.ref$.pipe(
            flatMap(async ref => {
                const iframe = await this.getIFrame(ref);
                return iframe.contents().find('body')[0];
            }),
            map(body => {
                const leaves = printExecTime("Rehydration", () => this.rehydratePage(body.ownerDocument as HTMLDocument));
                this.applySelectionListener(body);
                PageRenderer.appendAnnotationStyleToPageBody(body)
                this.m.applyGlobalLIstenersToPage(body)
                this.m.applyShiftListener(body)
/*
                leaves.forEach(v => {
                    v.popperElement
                })
*/
                return leaves;
            }));

        combineLatest([
            this.textNodes$,
            this.m.cardManager.trie.changeSignal$.pipe(debounceTime(500))
        ]).subscribe(async ([leaves]) => {
            printExecTime("Update words in annotated elements", () => {
                let uniqueLengths = uniq(this.m.cardManager.trie.t.getWords().map(w => w.length));
                const chars: Dictionary<IAnnotatedCharacter[]>[] = [];
                for (let i = 0; i < leaves.length; i++) {
                    const leaf = leaves[i];
                    chars.push(leaf.updateWords(this.m.cardManager.trie.t, uniqueLengths))
                }

                const wordTextNodeMap = chars.reduce((
                    acc: Dictionary<IAnnotatedCharacter[]>,
                    cDict: Dictionary<IAnnotatedCharacter[]>) => {
                    mergeWordTextNodeMap(cDict, acc);
                    return acc;
                }, {})
                this.wordTextNodeMap$.next(wordTextNodeMap);
            })
        })
    }


    rehydratePage(htmlDocument: HTMLDocument): AnnotatedElement[] {
        const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
        const annotatedElements = new Array(elements.length);
        for (let i = 0; i < elements.length; i++) {
            const annotatedElement = elements[i];
            annotatedElements[i] = new AnnotatedElement(this, annotatedElement as HTMLElement);
        }
        return annotatedElements;
    }

    async getIFrame(ref: HTMLElement): Promise<JQuery<HTMLIFrameElement>> {
        for (let i = 0; i < ref.children.length; i++) {
            ref.children[i].remove();
        }
        let iframe: JQuery<HTMLIFrameElement> = $(`#${this.getRenderParentElementId()}`).find('iframe');
        if (iframe.length) {
            iframe.contents().find('body').children().remove();
        } else {
            iframe = $(` <iframe style="border: none; width: 100%; height: 100%; font-family: sans-serif"> </iframe>`);
            iframe[0].srcdoc = this.src;

            iframe.appendTo(ref);

            // Maybe do this after?
        }
        await waitFor(() => iframe.contents().find('body').find('script').length > 0, 100)
        const v = iframe.contents().find('body').children().length;
        return iframe;
    }

    applySelectionListener(body: HTMLBodyElement) {
        const onMouseUp$ = fromEvent(body, 'mouseup');
        onMouseUp$.pipe(withLatestFrom(
            this.m.cardManager.cardIndex$
            ),
            debounceTime(100)
        ).subscribe(([e, currentDeck]) => {
            const activeEl = (body.ownerDocument as Document).activeElement;
            if (activeEl) {
                const selObj = (body.ownerDocument as Document).getSelection();
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

    getRenderParentElementId() {
        return `render_parent_${this.name}`
    }
}

