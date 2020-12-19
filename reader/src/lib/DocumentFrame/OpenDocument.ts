import {combineLatest, merge, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, tap} from "rxjs/operators";
import {DocumentWordCount} from "../Interfaces/DocumentWordCount";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {TrieWrapper} from "../TrieWrapper";
import {DocumentWordData, TextWordData} from "../Atomized/TextWordData";
import {AtomizedDocumentDocumentStats, AtomizedDocumentStats} from "../Atomized/AtomizedDocumentStats";
import {printExecTime} from "../Util/Timer";
import {ds_Dict} from "../Tree/DeltaScanner";
import {AtomizedStringsForRawHTML} from "../Pipes/AtomizedStringsForRawHTML";
import { AtomizedDocument} from "../Atomized/AtomizedDocument";
import {AtomizedStringsForURL} from "../Pipes/AtomizedStringsForURL";
import { rehydratePage } from "../Atomized/OpenedDocument";

export function getAtomizedDocumentDocumentStats(stats: AtomizedDocumentStats, name: string): AtomizedDocumentDocumentStats {
    return {
        ...stats,
        documentWordCounts: Object.fromEntries(
            Object.entries(stats.wordCounts).map(([word, count]) => [word, {count, word, document: name}])
        )
    }
}

export function getDocumentWordData(stats: TextWordData, name: string): DocumentWordData {
    return {
        ...stats,
        documentWordCounts: Object.fromEntries(
            Object.entries(stats.wordCounts).map(([word, count]) => [word, [{count, word, document: name}]])
        )
    }
}

export class OpenDocument {
    public id: string;
    public text$: Observable<string>;
    public wordCountRecords$: Observable<DocumentWordCount[]>;
    public renderedSentences$ = new ReplaySubject<ds_Dict<AtomizedSentence[]>>(1)
    public documentStats$: Observable<AtomizedDocumentDocumentStats>;

    public unAtomizedSrcDoc$= new ReplaySubject<string>(1);
    public url$ = new ReplaySubject<string>(1)

    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);
    atomizedSrcDocString$: Observable<string>;
    atomizedDocument$: Observable<AtomizedDocument>;

/*
    children$: Observable<ds_Dict<OpenDocument>>;
*/
    atomizedDocumentString$: Observable<string>;


    constructor(
        public name: string,
        public trie: Observable<TrieWrapper>,
        atomizedDocuments$: Observable<AtomizedDocument> | undefined,
    ) {
        this.id = name;
        this.atomizedDocumentString$ = merge(
            this.unAtomizedSrcDoc$.pipe(
                AtomizedStringsForRawHTML,
            ),
            this.url$.pipe(
                AtomizedStringsForURL,
            )
        ).pipe(shareReplay(1));

        this.atomizedSrcDocString$ = this.atomizedDocumentString$.pipe(
            map(strings => {
                return strings /*InterpolateService.text( `Could not find ${this.name}` );*/
            }),
            shareReplay(1)
        );
        this.atomizedDocument$ = atomizedDocuments$ || this.atomizedSrcDocString$.pipe(
            map(AtomizedDocument.fromAtomizedString),
            shareReplay(1)
        );

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


/*
        this.children$ = this.atomizedSrcDocStrings$.pipe(
            map(([originalDoc, ...documentChunks]) => {
                    return Object.fromEntries(
                        documentChunks.map((childDocStr, index) => {
                            const childName = `${this.name}_${index}`;
                            const args = AtomizedDocument.fromAtomizedString(childDocStr);
                            const childDoc = of(args)
                            return [
                                childName,
                                new OpenDocument(childName, trie, childDoc, this, this.applySentenceListeners),
                            ];
                        })
                    );
                }
            ),
            shareReplay(1)
        );
*/
    }

    async handleHTMLHasBeenRendered(head: HTMLHeadElement, body: HTMLBodyElement) {
        const sentences = printExecTime("Rehydration", () => {
            return rehydratePage(body.ownerDocument as HTMLDocument);
        });
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSentences$.next(sentences);
    }
}

