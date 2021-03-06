import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Segment} from "@shared/";
import {TrieWrapper} from "../TrieWrapper";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {AtomizedDocument} from "@shared/";
import {rehydratePage} from "../atomized/open-document.component";
import {
    SerializedTabulation,
    TabulatedDocuments,
    tabulatedSentenceToTabulatedDocuments
} from "@shared/";
import {flatten} from "lodash";
import {TabulateLocalDocument, TabulateRemoteDocument} from "../Workers/worker.helpers";
import {mergeTabulations} from "../merge-tabulations";
import {BrowserInputs} from "../hotkeys/browser-inputs";
import {setMouseOverText} from "../../components/translation-popup.component";

function flattenDictArray<T>(segments: ds_Dict<T[]>): T[] {
    return flatten(Object.values(segments));
}


export class OpenDocument {
    public name: string;
    public renderedSegments$ = new ReplaySubject<Segment[]>(1)
    public renderedTabulation$: Observable<TabulatedDocuments>;
    public virtualTabulation$: Observable<SerializedTabulation>;
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
        this.virtualTabulation$ = combineLatest([
            this.trie$,
            this.atomizedDocument$
        ]).pipe(
                switchMap(([trie, document]) => {
                    return TabulateLocalDocument({
                        label,
                        trieWords: Array.from(trie.t.values()),
                        src: document._originalSrc
                    })
                })
            );
    }

    async handleHTMLHasBeenRendered(head: HTMLHeadElement, body: HTMLBodyElement, inputs: BrowserInputs) {
        const segments = rehydratePage(body.ownerDocument as HTMLDocument);
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        segments.forEach(segment => segment.translationCb = translation => {
            if (inputs.latestTranslationTarget === segment) {
                setMouseOverText(translation)
            }
        })
        this.renderedSegments$.next(segments);
    }
}

