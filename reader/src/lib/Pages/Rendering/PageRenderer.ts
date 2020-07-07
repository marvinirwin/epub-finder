import {Observable, ReplaySubject, Subject} from "rxjs";
import $ from 'jquery';
import {Dictionary, uniq} from "lodash";
import {debounceTime, filter, flatMap, map} from "rxjs/operators";
import {SentenceElement} from "./SentenceElement";
import {IAnnotatedCharacter} from "../../Interfaces/Annotation/IAnnotatedCharacter";
import {mergeWordTextNodeMap} from "../../Util/mergeAnnotationDictionary";
import {printExecTime} from "../../Util/Timer";
import {waitFor} from "../../Util/waitFor";
import {isChineseCharacter} from "../../Interfaces/OldAnkiClasses/Card";
import {IWordCountRow} from "../../Interfaces/IWordCountRow";
import {ANNOTATE_AND_TRANSLATE} from "../../Atomize/AtomizedDocument";
import {AtomizedSentence} from "../../Atomize/AtomizedSentence";


// TODO divorce the renderer from the counter/analyzer
export class PageRenderer {
    ref$ = new ReplaySubject<HTMLElement>();
    wordTextNodeMap$ = new ReplaySubject<Dictionary<IAnnotatedCharacter[]>>(1);
    text$ = new ReplaySubject<string>(1);
    wordCountRecords$ = new Subject<IWordCountRow[]>();
    atomizedSentences$: Observable<AtomizedSentence[]>;

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
    background-color: #a0a0a0;;
    font-weight: bolder;
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

        this.atomizedSentences$ = this.ref$.pipe(
            flatMap(async ref => {
                const iframe = await this.getIFrame(ref);
                const body =  iframe.contents().find('body')[0];
                PageRenderer.appendAnnotationStyleToPageBody(body)
                return body;
            }),
            map((body: HTMLBodyElement) => {
                return printExecTime("Rehydration", () => this.rehydratePage(body.ownerDocument as HTMLDocument));
            })
        );

        this.

        combineLatest([
            this.textNodes$,
            this.m.cardManager.trie.changeSignal$.pipe(debounceTime(500)),
        ]).pipe(filter(([leaves]) => !!leaves.length)).subscribe(async ([leaves]) => {
            printExecTime("Update words in annotated elements", () => {
                let words = this.m.cardManager.trie.t.getWords();
                if (!words.length) {
                    return;
                }
                let uniqueLengths: number[] = uniq(words.map(w => w.length));
                const wordElementsMaps: Dictionary<IAnnotatedCharacter[]>[] = [];
                for (let i = 0; i < leaves.length; i++) {
                    const leaf = leaves[i];
                    let wordElementsMap = leaf.getWordElementMemberships(this.m.cardManager.trie.t, uniqueLengths);
                    wordElementsMaps.push(wordElementsMap)
                }

                const wordTextNodeMap = wordElementsMaps.reduce((
                    acc: Dictionary<IAnnotatedCharacter[]>,
                    cDict: Dictionary<IAnnotatedCharacter[]>) => {
                    mergeWordTextNodeMap(cDict, acc);
                    return acc;
                }, {});
                this.wordTextNodeMap$.next(wordTextNodeMap);
            })
        })
    }

    rehydratePage(htmlDocument: HTMLDocument): SentenceElement[] {
        const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
        const annotatedElements = new Array(elements.length);
        const text = [];
        for (let i = 0; i < elements.length; i++) {
            const annotatedElement = elements[i];
            let sentenceElement = new SentenceElement(this, annotatedElement as HTMLElement);
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
        await waitFor(() => iframe.contents().find('body').find('script').length > 0, 100)
        const v = iframe.contents().find('body').children().length;
        return iframe;
    }

    getRenderParentElementId() {
        return `render_parent_${this.name}`
    }
}
