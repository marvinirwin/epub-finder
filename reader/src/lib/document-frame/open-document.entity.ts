import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Segment} from "../atomized/segment";
import {TrieWrapper} from "../TrieWrapper";
import {printExecTime} from "../Util/Timer";
import {ds_Dict} from "../Tree/DeltaScanner";
import {AtomizedDocument} from "../atomized/atomized-document";
import {rehydratePage} from "../atomized/open-document.component";
import {mergeTabulations} from "../atomized/merge-tabulations";
import {
    TabulatedDocuments,
    TabulatedSentences,
    tabulatedSentenceToTabulatedDocuments
} from "../atomized/tabulated-documents.interface";
import {flatten} from "lodash";
import {TabulateDocuments} from "../Workers/worker.helpers";

function flattenDictArray<T>(segments: ds_Dict<T[]>): T[] {
    return flatten(Object.values(segments));
}


export class OpenDocument {
    public name: string;
    public renderedSegments$ = new ReplaySubject<Segment[]>(1)
    public renderedTabulation$: Observable<TabulatedDocuments>;

    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);

    /*
        public notableSubsequences$: Observable<TabulatedSentences>;
    */

    constructor(
        public id: string,
        public trie$: Observable<TrieWrapper>,
        public atomizedDocument$: Observable<AtomizedDocument>,
        public label: string
    ) {
        this.name = id;
        this.renderedSegments$.next([]);
        this.renderedTabulation$ = combineLatest([
            this.renderedSegments$,
            trie$,
        ]).pipe(
            map(([segments, trie]) => {
                    const tabulatedSentences = mergeTabulations(Segment.tabulateSentences(
                        segments,
                        trie.t,
                        trie.uniqueLengths()
                    ));

                    return tabulatedSentenceToTabulatedDocuments(tabulatedSentences, this.label);
                }
            ),
            shareReplay(1),
        );

        /*
                this.notableSubsequences$ = this.renderedSegments$.pipe(
                    map(segments => segments.map(segment => segment.translatableText).join('')),
                    switchMap(TabulateDocuments),
                    shareReplay(1),
                )
        */
    }

    async handleHTMLHasBeenRendered(head: HTMLHeadElement, body: HTMLBodyElement) {
        const sentences = printExecTime("Rehydration", () => {
            return rehydratePage(body.ownerDocument as HTMLDocument);
        });
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSegments$.next(sentences);
    }
}

