import {combineLatest, merge, Observable, of, ReplaySubject} from "rxjs";
import {map, shareReplay, startWith, switchMap, tap} from "rxjs/operators";
import {Website} from "../Website/Website";
import {Segment} from "../atomized/segment";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree, NamedDeltaScanner} from "../Tree/DeltaScanner";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";
import {AtomizedDocument} from "../atomized/atomized-document";
import {DatabaseService} from "../Storage/database.service";
import {SettingsService} from "../../services/settings.service";
import {BasicDocument} from "../../types";
import {filterMap, mapMap, mapToArray} from "../map.module";
import {LibraryService} from "./library.service";
import {OpenDocument} from "../document-frame/open-document.entity";
import {AtomizedDocumentSources, DocumentSourcesService} from "../document-frame/document-sources.service";
import {TabulatedDocuments} from "../atomized/tabulated-documents.interface";
import {mergeTabulations} from "../atomized/merge-tabulations";
import {DocumentRepository} from "../documents/document.repository";
import {TrieWrapper} from "../TrieWrapper";


export type TrieObservable = Observable<TrieWrapper>;

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
    sourceDocuments$: Observable<Map<string, OpenDocument>>;
    tabulationsOfCheckedOutDocuments$: Observable<TabulatedDocuments>;
    openDocumentBodies$: Observable<HTMLBodyElement>;
    renderedSegments$: Observable<Segment[]>;

    constructor(
        private config: {
            trie$: TrieObservable,
            db: DatabaseService;
            settingsService: SettingsService;
            documentRepository: DocumentRepository;
        }
    ) {

        this.sourceDocuments$ = config.documentRepository.collection$.pipe(
            /*
                        map(documents => filterMap(documents, (key, d) => !d.deleted)),
            */
            map(documents => {
                return mapMap(
                    documents,
                    (id, document) => {
                        const documentSource: AtomizedDocumentSources = {}
                        if (document.filename) {
                            documentSource.url$ = of(`/documents/${(document.filename)}`)
                        }
                        const openDocument = new OpenDocument(
                            document.id(),
                            config.trie$,
                            DocumentSourcesService.document(documentSource),
                            document.name
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
                                children,
                                nodeLabel: SOURCE_DOCUMENTS_NODE_LABEL,
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
                    mergeTabulations(...documentTabulations),
                ),
                shareReplay(1)
            );


        this.openDocumentBodies$ = this.openDocumentTree
            .mapWith(r => r.renderRoot$)
            .updates$
            .pipe(
                switchMap(({sourced}) => {
                    // TODO this will result in
                    return merge(...flattenTree(sourced));
                }),
                shareReplay(1)
            );
        this.renderedSegments$ = this.openDocumentTree
            .mapWith(r => r.renderedSegments$)
            .updates$
            .pipe(
                switchMap(({sourced}) => merge(...flattenTree(sourced))),
                shareReplay(1)
            )
    }

}