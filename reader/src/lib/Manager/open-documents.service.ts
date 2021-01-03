import {combineLatest, merge, Observable, of, ReplaySubject} from "rxjs";
import {map, shareReplay, startWith, switchMap} from "rxjs/operators";
import {Website} from "../Website/Website";
import {Segment} from "../Atomized/segment";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree, NamedDeltaScanner} from "../Tree/DeltaScanner";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";
import {AtomizedDocument} from "../Atomized/atomized-document";
import {TrieObservable} from "./QuizCharacter";
import {DatabaseService} from "../Storage/database.service";
import {SettingsService} from "../../services/settings.service";
import {BasicDocument} from "../../types";
import {filterMap, mapMap, mapToArray} from "../map.module";
import {LibraryService} from "./library.service";
import {OpenDocument} from "../DocumentFrame/open-document.entity";
import {AtomizedDocumentSources, DocumentSourcesService} from "../DocumentFrame/document-sources.service";
import {TabulatedDocuments} from "../Atomized/tabulated-documents.interface";
import {mergeTabulations} from "../Atomized/merge-tabulations";


export type Named = {
    name: string;
}

export const SOURCE_DOCUMENTS_NODE_LABEL = 'libraryDocuments';
export const EXAMPLE_SENTENCE_DOCUMENT = 'exampleSentences';
export const READING_DOCUMENT_NODE_LABEL = 'readingDocument';
export const isWebsite = (variableToCheck: any): variableToCheck is Website =>
    (variableToCheck as Website).url !== undefined;
export const isCustomDocument = (variableToCheck: any): variableToCheck is BasicDocument =>
    (variableToCheck as BasicDocument).html !== undefined;

export class OpenDocumentsService {
    openDocumentTree = new NamedDeltaScanner<OpenDocument, string>();
    // Rendered means that their atomizedSentences exist, but aren't necessarily in the viewport
    displayDocumentTabulation$: Observable<TabulatedDocuments>;
    displayDocument$: Observable<AtomizedDocument>;
    readingDocument$ = new ReplaySubject<OpenDocument>(1);
    sourceDocuments$: Observable<Map<string, OpenDocument>>;
    tabulationsOfCheckedOutDocuments$: Observable<TabulatedDocuments>;
    newOpenDocumentDocumentBodies$: Observable<HTMLBodyElement>;
    newRenderedSegments$: Observable<ds_Dict<Segment[]>>;

    constructor(
        private config: {
            trie$: TrieObservable,
            db: DatabaseService;
            settingsService: SettingsService;
            libraryService: LibraryService;
        }
    ) {

        this.sourceDocuments$ = config.libraryService.documents$.pipe(
            map(documents => filterMap(documents, (key, d) => !d.deleted)),
            map(libraryDocuments => {
                return mapMap(
                    libraryDocuments,
                    (id, {name, html, filename}) => {
                        const documentSource: AtomizedDocumentSources = {}
                        if (html) {
                            // TODO replaceSubject here?
                            documentSource.unAtomizedDocument$ = of(html);
                        }
                        if (filename) {
                            documentSource.url$ = of(`/documents/${filename}`)
                        }
                        const openDocument = new OpenDocument(
                            name,
                            config.trie$,
                            DocumentSourcesService.document(documentSource)
                        );
                        return [
                            id,
                            openDocument
                        ];
                    }
                )
            }),
            shareReplay(1)
        );

        this.sourceDocuments$.subscribe(
            openDocuments => {
                const children = Object.fromEntries(
                    [...openDocuments.entries()]
                        .map(([name, openDocument]) => [
                                name,
                                {
                                    value: openDocument,
                                    nodeLabel: name
                                }
                            ]
                        )
                );
                this.openDocumentTree.appendDelta$.next(
                    {
                        nodeLabel: 'root',
                        children: {
                            [SOURCE_DOCUMENTS_NODE_LABEL]: {
                                nodeLabel: SOURCE_DOCUMENTS_NODE_LABEL,
                                children: children
                            }
                        },
                    }
                );
            }
        )

        this.tabulationsOfCheckedOutDocuments$ = this.sourceDocuments$.pipe(
            switchMap(openDocuments =>
                combineLatest(mapToArray(openDocuments, (id, document) => document.renderedTabulation$))
            ),
            map(tabulations => mergeTabulations(...tabulations)),
            shareReplay(1)
        );

        this.displayDocumentTabulation$ = this.openDocumentTree.mapWith(document => document.renderedTabulation$)
            .updates$.pipe(
                switchMap(({sourced}) => {
                    const sourceDocuments = sourced?.children?.[READING_DOCUMENT_NODE_LABEL];
                    const documentTabulations: Observable<TabulatedDocuments>[] = flattenTree<Observable<TabulatedDocuments>>(sourceDocuments);
                    return combineLatest(documentTabulations);
                }),
                map((documentTabulations: TabulatedDocuments[]) =>
                    mergeTabulations(...documentTabulations)
                ),
                shareReplay(1)
            );

        this.displayDocument$ = this.readingDocument$.pipe(
            switchMap(readingDocument => {
                if (!readingDocument) return of<AtomizedDocument>();
                return readingDocument.atomizedDocument$;
            }),
            shareReplay(1)
        );


        this.newOpenDocumentDocumentBodies$ = this.openDocumentTree
            .mapWith(r => r.renderRoot$)
            .updates$
            .pipe(
                switchMap(({delta}) => merge(...flattenTree(delta))),
                shareReplay(1)
            );
        this.newRenderedSegments$ = this.openDocumentTree
            .mapWith(r => r.renderedSegments$)
            .updates$
            .pipe(
                switchMap(({delta}) => merge(...flattenTree(delta))),
                shareReplay(1)
            )
    }

}