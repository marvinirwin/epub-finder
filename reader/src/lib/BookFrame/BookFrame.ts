import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import $ from 'jquery';
import {Dictionary} from "lodash";
import {flatMap, map, shareReplay, switchMap, withLatestFrom} from "rxjs/operators";
import {printExecTime} from "../Util/Timer";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {sleep} from "../Util/Util";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE} from "../Atomized/AtomizedDocument";
import {appendBookFrameStyle} from "./AppendBookFrameStyle";
import {TrieWrapper} from "../TrieWrapper";
import {ColdSubject} from "../Util/ColdSubject";
import {TextWordData} from "../Atomized/TextWordData";
import {DeltaScanner} from "../Util/DeltaScanner";

export class BookFrame {
    public frame = new Frame();

    // This shouldn't be an observable, right?
    public id: string;
    public text$ = new ReplaySubject<string>(1);
    public wordCountRecords$ = new Subject<IWordCountRow[]>();
    public atomizedSentencesFromSrc$: Observable<AtomizedSentence[]>;
    public trie = new ColdSubject<TrieWrapper>();
    public textData$: Observable<TextWordData>;
    public src$ = new ReplaySubject<string>(1);
    public manuallyAddedAtomizedSentences = new DeltaScanner<AtomizedSentence>();



    constructor(
        src: string,
        public name: string,
    ) {
        this.src$.next(src);
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


        // I assume this will be subscribed to, I want its side effects
        this.atomizedSentencesFromSrc$ = combineLatest([
            this.frame.iframe$,
            this.src$
        ]).pipe(
            switchMap(async ([{body, iframe}, src]) => {
                await Frame.SetIFrameSource(iframe, src);
                return {body, iframe};
            }),
            map(({body}) => {
                return printExecTime("Rehydration", () => this.rehydratePage(body.ownerDocument as HTMLDocument));
            }),
            shareReplay(1)
        );

/*
        this.atomizedSentencesFromSrc$.pipe(
            withLatestFrom(this.manuallyAddedAtomizedSentences.updates$, this.frame.iframe$)
        ).subscribe(([atomizedSentencesFromSrc, {sourced}, iframeBbdy]) => {
            Object.values(sourced).map(v => v.value).forEach(manuallyAddedSentence => {
                manuallyAddedSentence.(iframebody);
            })
        })
*/

        this.textData$ = combineLatest([
            this.trie.obs$,
            this.atomizedSentencesFromSrc$
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

    getRenderParentElementId() {
        return `render_parent_${this.name}`
    }
}

export type IFrameReturnValue = { iframe: HTMLIFrameElement; body: HTMLBodyElement };

export class Frame {
    public static async SetIFrameSource(iframe: HTMLIFrameElement, src: string) {
        iframe.srcdoc = src;
        await sleep(500);
    }

    iframeContainerRef$ = new ReplaySubject<HTMLElement>(1);
    iframe$: Observable<IFrameReturnValue>;

    constructor() {
        this.iframe$ = this.iframeContainerRef$.pipe(
            switchMap(async containerRef => {
                const iframe = await this.createIFrame(containerRef);
                const body = $(iframe).contents().find('body')[0];
                appendBookFrameStyle(body.ownerDocument as Document);
                return {iframe, body};
            })
        )
    }

    async createIFrame(ref: HTMLElement): Promise<HTMLIFrameElement> {
        for (let i = 0; i < ref.children.length; i++) {
            ref.children[i].remove();
        }
        const iframe = $(` <iframe style="border: none; width: 100%; height: 100%; font-family: sans-serif"> </iframe>`)[0];
        ref.appendChild(iframe);
        return iframe as HTMLIFrameElement;
    }
}

