import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {Segment} from "../Atomized/segment";
import {TrieWrapper} from "../TrieWrapper";
import {printExecTime} from "../Util/Timer";
import {ds_Dict} from "../Tree/DeltaScanner";
import {AtomizedDocument} from "../Atomized/atomized-document";
import {rehydratePage} from "../Atomized/open-document.component";
import {mergeTabulations} from "../Atomized/merge-tabulations";
import {TabulatedDocuments} from "../Atomized/tabulated-documents.interface";
import {flatten} from "lodash";
import {IdentifySubsequences} from "../Workers/WorkerHelpers";
import {SubSequenceReturn} from "../subsequence-return.interface";

function flattenDictArray<T>(segments: ds_Dict<T[]>): T[] {
    return flatten(Object.values(segments));
}


export class OpenDocument {
    public name: string;
    public renderedSegments$ = new ReplaySubject<Segment[]>(1)
    public renderedTabulation$: Observable<TabulatedDocuments>;

    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);
    public notableSubsequences$: Observable<SubSequenceReturn>;

    constructor(
        public id: string,
        public trie: Observable<TrieWrapper>,
        public atomizedDocument$: Observable<AtomizedDocument>,
        public label: string
    ) {
        this.name = id;
        this.renderedSegments$.next([]);
        this.renderedTabulation$ = combineLatest([
            this.renderedSegments$,
            trie,
        ]).pipe(
            map(([segments, trie]) => {
                    const tabulatedSentences = mergeTabulations(Segment.tabulateSentences(
                        segments,
                        trie.t,
                        trie.uniqueLengths()
                    ));

                    // Right now this will count the example sentences :(.
                    const entries = Object.entries(tabulatedSentences.wordCounts)
                        .map(([word, count]) =>
                            [word, [{word, count, document: this.label}]]);

                    return {
                        ...tabulatedSentences,
                        documentWordCounts: Object.fromEntries(entries)
                    } as TabulatedDocuments;
                }
            ),
            shareReplay(1),
        );

        this.notableSubsequences$ = this.renderedSegments$.pipe(
            map(segments => segments.map(segment => segment.translatableText).join('')),
            switchMap(IdentifySubsequences),
            shareReplay(1),
        )
    }

    async handleHTMLHasBeenRendered(head: HTMLHeadElement, body: HTMLBodyElement) {
        const sentences = printExecTime("Rehydration", () => {
            return rehydratePage(body.ownerDocument as HTMLDocument);
        });
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSegments$.next(sentences);
    }
}

