import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {
    annotatedAndTranslated,
    AtomizedDocument,
    Segment, SerializedDocumentTabulation,
    SerializedTabulation,
    TabulatedDocuments,
    tabulatedSentenceToTabulatedDocuments
} from "@shared/";
import {TrieWrapper} from "../TrieWrapper";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {flatten} from "lodash";
import {TabulateLocalDocument} from "../Workers/worker.helpers";
import {mergeTabulations} from "../merge-tabulations";
import {XMLDocumentNode} from "../../../../server/src/shared/XMLDocumentNode";
import {BrowserSegment} from "../browser-segment";
import {SettingsService} from "../../services/settings.service";
import {LanguageConfigsService} from "../language-configs.service";

export class OpenDocument {
    public name: string;
    public renderedSegments$ = new ReplaySubject<BrowserSegment[]>(1)
    public renderedTabulation$: Observable<TabulatedDocuments>;
    public virtualTabulation$: Observable<SerializedDocumentTabulation>;
    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);

    constructor(
        public id: string,
        public trie$: Observable<TrieWrapper>,
        public atomizedDocument$: Observable<AtomizedDocument>,
        public label: string,
        public settingsService: SettingsService,
        public languageConfigsService: LanguageConfigsService
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

    async handleHTMLHasBeenRendered(
        head: HTMLHeadElement,
        body: HTMLDivElement,
    ) {
        const segments = [...(body.ownerDocument as HTMLDocument).getElementsByClassName(annotatedAndTranslated)]
            .map(element => {
                return new BrowserSegment({
                    element: element as unknown as XMLDocumentNode,
                    languageConfigsService: this.languageConfigsService,
                    settingsService: this.settingsService
                });
            });
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSegments$.next(segments);
    }
}

