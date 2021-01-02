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
import {AtomMetadataIndex} from "../Atomized/atom-metadata-index";

export class OpenDocument {
    public id: string;
    public renderedSentences$ = new ReplaySubject<ds_Dict<Segment[]>>(1)
    public tabulation$: Observable<TabulatedDocuments>;

    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);
    public atomMetadataIndex$: Observable<AtomMetadataIndex>;

    constructor(
        public name: string,
        public trie: Observable<TrieWrapper>,
        public atomizedDocument$: Observable<AtomizedDocument>
    ) {
        this.renderedSentences$.next({});
        this.id = name;
        this.tabulation$ = combineLatest([
            this.atomizedDocument$,
            trie,
        ]).pipe(
            map(([document, trie]) => {
                    return mergeTabulations(
                        ...document.segments()
                            .map(s => s.tabulate(trie.t, trie.uniqueLengths()))
                    );
                }
            ),
            shareReplay(1)
        );
        this.atomMetadataIndex$ = this.atomizedDocument$
            .pipe(map(atomizedDocument => {
                    return new AtomMetadataIndex(
                        atomizedDocument.atomElements(),
                        this.tabulation$
                    );
                }
                ),
                shareReplay(1)
            );
    }

    async handleHTMLHasBeenRendered(head: HTMLHeadElement, body: HTMLBodyElement) {
        const sentences = printExecTime("Rehydration", () => {
            return rehydratePage(body.ownerDocument as HTMLDocument);
        });
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSentences$.next(sentences);
    }
}

