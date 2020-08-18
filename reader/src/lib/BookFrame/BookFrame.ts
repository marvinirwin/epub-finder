import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import $ from 'jquery';
import {Dictionary} from "lodash";
import {flatMap, map, shareReplay} from "rxjs/operators";
import {printExecTime} from "../Util/Timer";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {getUniqueLengths, sleep} from "../Util/Util";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE} from "../Atomized/AtomizedDocument";
import {bookFrameStyle} from "./BookFrameStyle";
import {TrieWrapper} from "../TrieWrapper";
import {ColdSubject} from "../Util/ColdSubject";
import {TextWordData} from "../Atomized/TextWordData";


export class BookFrame {
    // This shouldn't be an observable, right?
    id: string;
    ref$ = new ReplaySubject<HTMLElement>(1);
    text$ = new ReplaySubject<string>(1);
    wordCountRecords$ = new Subject<IWordCountRow[]>();
    atomizedSentences$: Observable<AtomizedSentence[]>;
    iframebody$: Observable<HTMLBodyElement>;
    trie = new ColdSubject<TrieWrapper>();
    textData$: Observable<TextWordData>;


    private static appendAnnotationStyleToPageBody(body: HTMLElement) {
        $(bookFrameStyle).appendTo(body);
    }

    constructor(
        public src: string,
        public name: string,
    ) {
        this.id = name;
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
                BookFrame.appendAnnotationStyleToPageBody(body)
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

        this.textData$ = combineLatest([
            this.trie.obs$,
            this.atomizedSentences$
        ]).pipe(
            map(([trie, sentences]) =>
                AtomizedSentence.getTextWordData(sentences, trie.t, trie.getUniqueLengths()),
            ),
            shareReplay(1)
        )
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
        await sleep(500);
        return iframe;
    }

    getRenderParentElementId() {
        return `render_parent_${this.name}`
    }
}

