import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {Dictionary} from "lodash";
import {map, shareReplay} from "rxjs/operators";
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

export type SentenceDataPipe = (srcDoc$: Observable<[string, TrieWrapper]>) => Observable<AtomizedDocumentStats>;

export class OpenBook {
    public frame = new Frame();

    // This shouldn't be an observable, right?
    public id: string;
    public text$: Observable<string>;
    public wordCountRecords$: Observable<IWordCountRow[]>;
    public htmlElementIndex$: Observable<TextWordData>;
    public renderedSentences$ = new ReplaySubject<ds_Dict<AtomizedSentence>>(1)
    public bookStats$: Observable<AtomizedDocumentStats>;

    constructor(
        srcDoc: string,
        public name: string,
        public renderer: BookRenderer,
        public trie: Observable<TrieWrapper>,
        public sentenceDataPipe: SentenceDataPipe,
    ) {
        this.id = name;
        this.bookStats$ = combineLatest([this.renderer.srcDoc$, trie]).pipe(this.sentenceDataPipe)
        this.text$ = this.bookStats$.pipe(map(bookStats => bookStats.text), shareReplay(1))
        this.renderer.frame$.next(this.frame);
        this.renderer.srcDoc$.next(srcDoc);
        this.wordCountRecords$ = this.wordCountRecords()

        this.htmlElementIndex$ =  combineLatest([
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
        this.renderedSentences$.next(sentences);
    }
}

