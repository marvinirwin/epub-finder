import {combineLatest, Observable, ReplaySubject, merge} from "rxjs";
import {Dictionary} from "lodash";
import {map, shareReplay, tap, withLatestFrom} from "rxjs/operators";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {TrieWrapper} from "../TrieWrapper";
import {TextWordData} from "../Atomized/TextWordData";
import {BookRenderer} from "./Renderer/BookRenderer";
import {Frame} from "./Frame";
import {AtomizedDocumentStats} from "../Atomized/AtomizedDocumentStats";
import {printExecTime} from "../Util/Timer";
import {IFrameBookRenderer} from "./Renderer/IFrameBookRenderer";
import {ds_Dict} from "../Util/DeltaScanner";
import {BrowserInputs} from "../Manager/BrowserInputs";
import {AtomizedStringForRawHTML} from "../Pipes/AtomizedStringForRawHTML";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {AtomizedStringForURL} from "../Pipes/AtomizedStringForURL";

/*
export type AtomizedDocumentSentenceDataPipe = (atomizedSrcDocStringAndTrie$: Observable<[string, TrieWrapper]>) => Observable<AtomizedDocumentStats>;
export type AtomizedDocumentStringPipe = (unatomizedSrcDoc$: Observable<string>) => Observable<string>;
*/

export class OpenBook {
    public frame = new Frame();
    public id: string;
    public text$: Observable<string>;
    public wordCountRecords$: Observable<IWordCountRow[]>;
    public htmlElementIndex$: Observable<TextWordData>;
    public renderedSentences$ = new ReplaySubject<ds_Dict<AtomizedSentence>>(1)
    public bookStats$: Observable<AtomizedDocumentStats>;

    public unAtomizedSrcDoc$ = new ReplaySubject<string>(1);
    public url$ = new ReplaySubject<string>(1)

    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);
    atomizedSrcDocString$: Observable<string>;
    atomizedDocument$: Observable<AtomizedDocument>;

    constructor(
        public name: string,
        public trie: Observable<TrieWrapper>,
    ) {
        this.id = name;
        this.atomizedSrcDocString$ = merge(
            this.unAtomizedSrcDoc$.pipe(
                AtomizedStringForRawHTML
            ),
            this.url$.pipe(
                AtomizedStringForURL
            )
        );
        this.atomizedDocument$ = this.atomizedSrcDocString$.pipe(map(AtomizedDocument.fromString))
        this.bookStats$ = combineLatest([
            this.atomizedDocument$,
            trie
        ]).pipe(
            map(([document, trie]) => document.getDocumentStats(trie)),
            shareReplay(1)
        )
        this.text$ = this.bookStats$.pipe(map(bookStats => bookStats.text), shareReplay(1))
        this.wordCountRecords$ = this.wordCountRecords();
        this.renderedSentences$.subscribe(sentences => {
            BrowserInputs.applyAtomizedSentenceListeners(Object.values(sentences));
        })


        this.htmlElementIndex$ = combineLatest([
            this.trie,
            this.renderedSentences$
        ]).pipe(
            map(([trie, sentences]) => {
                    return AtomizedSentence.getTextWordData(Object.values(sentences), trie.t, trie.getUniqueLengths());
                },
            ),
            shareReplay(1)
        )
    }


    private wordCountRecords() {
        return this.text$.pipe(
            map(text => {
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

                return Object.entries(countedCharacters).map(([letter, count]) => ({
                    book: this.name,
                    word: letter,
                    count
                }))
            }),
            shareReplay(1)
        );
    }

    handleHTMLHasBeenRendered(head: HTMLHeadElement, body: HTMLBodyElement) {
        const sentences = printExecTime("Rehydration", () => IFrameBookRenderer.rehydratePage(head.ownerDocument as HTMLDocument));
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSentences$.next(sentences);
    }
}

