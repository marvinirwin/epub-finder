import {Observable, ReplaySubject, Subject} from "rxjs";
import $ from 'jquery';
import {Dictionary, uniq} from "lodash";
import {flatMap, map, share, shareReplay} from "rxjs/operators";
import {IAnnotatedCharacter} from "./Interfaces/Annotation/IAnnotatedCharacter";
import {printExecTime} from "./Util/Timer";
import {waitFor} from "./Util/waitFor";
import {isChineseCharacter} from "./Interfaces/OldAnkiClasses/Card";
import {IWordCountRow} from "./Interfaces/IWordCountRow";
import {ANNOTATE_AND_TRANSLATE} from "./Atomize/AtomizedDocument";
import {AtomizedSentence} from "./Atomize/AtomizedSentence";
import {XMLDocumentNode} from "./Interfaces/XMLDocumentNode";
import {sleep} from "./Util/Util";


export class PageRenderer {
    ref$ = new ReplaySubject<HTMLElement>();
    text$ = new ReplaySubject<string>(1);
    wordCountRecords$ = new Subject<IWordCountRow[]>();
    atomizedSentences$: Observable<AtomizedSentence[]>;
    iframebody$: Observable<HTMLBodyElement>;

    private static appendAnnotationStyleToPageBody(body: HTMLElement) {
        let style = $(`
                    <style>
mark {
    position: relative;
    background: transparent;
}
mark.highlighted::after {
    opacity: 1;
}
mark::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #a0a0a0;
    opacity: 0;
    transition: opacity 250ms;
    z-index: -1;
}

mark:hover {
  cursor: pointer;
}

.annotated_and_translated {
    position: relative;
}
.annotated_and_translated:hover::after {
    opacity: 0.15;
}
.annotated_and_translated::after {
    content: "";
    position: absolute;
    z-index: -1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #a0a0a0;
    opacity: 0;
    transition: opacity 250ms;
}

.POPPER_ELEMENT {
    background-color: #333;
    color: white;
    padding: 15px 15px;
    border-radius: 4px;
    font-size: 13px;
    height: fit-content;
    z-index: 9999;
    display: none;
    
}

.POPPER_ELEMENT[data-show] {
    display: block;
}



</style>
                    `);
        style.appendTo(body);
    }

    constructor(
        public src: string,
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

        this.iframebody$ = this.ref$.pipe(
            flatMap(async ref => {
                const iframe = await this.getIFrame(ref);
                await sleep(500);// If I dont put this wait, the DOM Doesnt fully load and every sentence does get parsed
                // its weird
                const body = iframe.contents().find('body')[0];
                PageRenderer.appendAnnotationStyleToPageBody(body)
                return body;
            }),
            shareReplay(1)
        );
        this.atomizedSentences$ = this.iframebody$.pipe(
            map((body: HTMLBodyElement) => {
                return printExecTime("Rehydration", () => this.rehydratePage(body.ownerDocument as HTMLDocument));
            }),
            shareReplay(1)
        );

    }

    rehydratePage(htmlDocument: HTMLDocument): AtomizedSentence[] {
        const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
        const annotatedElements = new Array(elements.length);
        const text = [];
        for (let i = 0; i < elements.length; i++) {
            const annotatedElement = elements[i];
            let sentenceElement = new AtomizedSentence(annotatedElement as unknown as XMLDocumentNode);
            annotatedElements[i] = sentenceElement;
            text.push(sentenceElement.translatableText);
        }
        this.text$.next(text.join(''))
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
        // await waitFor(() => iframe.contents().find('body').children.length > 0, 100)
        // TODO figure out a reliable way to figure out when the iframe has loaded
        await sleep(500);
        const v = iframe.contents().find('body').children().length;
        return iframe;
    }

    getRenderParentElementId() {
        return `render_parent_${this.name}`
    }
}

