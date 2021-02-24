import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Segment} from "../../../../server/src/shared/tabulate-documents/segment";
import {TrieWrapper} from "../TrieWrapper";
import {printExecTime} from "../Util/Timer";
import {ds_Dict} from "../Tree/DeltaScanner";
import {AtomizedDocument} from "../../../../server/src/shared/tabulate-documents/atomized-document";
import {rehydratePage} from "../atomized/open-document.component";
import {mergeTabulations} from "../../../../server/src/shared/tabulate-documents/merge-tabulations";
import {
    TabulatedDocuments,
    tabulatedSentenceToTabulatedDocuments
} from "../../../../server/src/shared/tabulate-documents/tabulated-documents.interface";
import {flatten} from "lodash";
import {TabulateDocuments} from "../Workers/worker.helpers";

function flattenDictArray<T>(segments: ds_Dict<T[]>): T[] {
    return flatten(Object.values(segments));
}


export class OpenDocument {
    public name: string;
    public renderedSegments$ = new ReplaySubject<Segment[]>(1)
    public renderedTabulation$: Observable<TabulatedDocuments>;
    public virtualTabulation$: Observable<TabulatedDocuments>;
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
                    const tabulatedSentences = mergeTabulations(Segment.tabulate(
                        trie.t,
                        segments,
                    ));

                    return tabulatedSentenceToTabulatedDocuments(tabulatedSentences, this.label);
                }
            ),
            shareReplay(1),
        );
        this.virtualTabulation$ = this.trie$.pipe(
                switchMap(trie => {
                    return TabulateDocuments({
                        trieWords: trie.t.getWords(),
                        d: {filename: this.}
                    })
                })
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
        const sentences = rehydratePage(body.ownerDocument as HTMLDocument);
        /*printExecTime("Rehydration", () => {
            return
        });*/
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSegments$.next(sentences);
    }
}

