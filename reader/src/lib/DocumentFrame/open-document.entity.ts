import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, tap, withLatestFrom} from "rxjs/operators";
import {Segment} from "../Atomized/segment";
import {TrieWrapper} from "../TrieWrapper";
import {printExecTime} from "../Util/Timer";
import {ds_Dict} from "../Tree/DeltaScanner";
import {AtomizedDocument} from "../Atomized/atomized-document";
import {rehydratePage} from "../Atomized/open-document.component";
import {mergeTabulations} from "../Atomized/merge-tabulations";
import {TabulatedDocuments} from "../Atomized/tabulated-documents.interface";
import {flatten} from "lodash";

function flattenDictArray<T>(segments: ds_Dict<T[]>): T[]  {
    return flatten(Object.values(segments));
}


export class OpenDocument {
    public id: string;
    public renderedSegments$ = new ReplaySubject<ds_Dict<Segment[]>>(1)
    public renderedTabulation$: Observable<TabulatedDocuments>;

    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);

    constructor(
        public name: string,
        public trie: Observable<TrieWrapper>,
        public atomizedDocument$: Observable<AtomizedDocument>
    ) {
        this.renderedSegments$.next({});
        this.id = name;
        this.renderedTabulation$ = combineLatest([
            this.renderedSegments$,
            trie,
        ]).pipe(
            map(([segments, trie]) => {
                    return mergeTabulations(
                        ...flattenDictArray(segments)
                            .map(segment => segment.tabulate(trie.t, trie.uniqueLengths()))
                    );
                }
            ),
            shareReplay(1),
        );
    }

    async handleHTMLHasBeenRendered(head: HTMLHeadElement, body: HTMLBodyElement) {
        const sentences = printExecTime("Rehydration", () => {
            return rehydratePage(body.ownerDocument as HTMLDocument);
        });
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSegments$.next(sentences);
    }
}

