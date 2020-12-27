import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {DocumentWordCount} from "../Interfaces/DocumentWordCount";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {TrieWrapper} from "../TrieWrapper";
import {AtomizedDocumentDocumentStats} from "../Atomized/AtomizedDocumentStats";
import {printExecTime} from "../Util/Timer";
import {ds_Dict} from "../Tree/DeltaScanner";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {rehydratePage} from "../Atomized/OpenedDocument";
import {getAtomizedDocumentDocumentStats} from "./atomized-document-stats.service";

export class OpenDocument {
    public id: string;
    public text$: Observable<string>;
    public wordCountRecords$: Observable<DocumentWordCount[]>;
    public renderedSentences$ = new ReplaySubject<ds_Dict<AtomizedSentence[]>>(1)
    public documentStats$: Observable<AtomizedDocumentDocumentStats>;

    public url$ = new ReplaySubject<string>(1)

    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);

    constructor(
        public name: string,
        public trie: Observable<TrieWrapper>,
        public atomizedDocument$: Observable<AtomizedDocument>
    ) {
        this.renderedSentences$.next({});
        this.id = name;
        this.documentStats$ = combineLatest([
            this.atomizedDocument$,
            trie
        ]).pipe(
            map(([document, trie]) => {
                const stats = document.getDocumentStats(trie);
                return getAtomizedDocumentDocumentStats(stats, this.name);
            }),
            shareReplay(1)
        );


        this.text$ = this.documentStats$.pipe(map(documentStats => documentStats.text), shareReplay(1));

        this.wordCountRecords$ = this.documentStats$.pipe(
            map(documentStat => {
                    return Object.values(documentStat.documentWordCounts);
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

