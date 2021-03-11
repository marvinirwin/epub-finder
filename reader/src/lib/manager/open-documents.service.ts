import {combineLatest, merge, Observable, of} from "rxjs";
import {map, shareReplay, switchMap} from "rxjs/operators";
import {Website} from "../Website/Website";
import {Segment, SerializedDocumentTabulation} from "@shared/";
import {flattenTree, NamedDeltaScanner} from "../delta-scan/delta-scan.module";
import {DatabaseService} from "../Storage/database.service";
import {SettingsService} from "../../services/settings.service";
import {BasicDocument} from "../../types";
import {mapMap, mapToArray} from "../map.module";
import {OpenDocument} from "../document-frame/open-document.entity";
import {AtomizedDocumentSources, DocumentSourcesService} from "../document-frame/document-sources.service";
import {
    SerializedTabulation,
    TabulatedDocuments
} from "@shared/";
import {DocumentRepository} from "../documents/document.repository";
import {TrieWrapper} from "../TrieWrapper";
import {SerializedTabulationAggregate} from "../../../../server/src/shared/tabulation/serialized-tabulation.aggregate";
import {mergeTabulations} from "../merge-tabulations";
import {LanguageConfigsService} from "../language-configs.service";
import {BrowserSegment} from "../browser-segment";

export type TrieObservable = Observable<TrieWrapper>;

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
    renderedSegments$: Observable<BrowserSegment[]>;
    virtualDocumentTabulation$: Observable<SerializedTabulationAggregate>;

    constructor(
        private config: {
            trie$: TrieObservable,
            db: DatabaseService;
            settingsService: SettingsService;
            documentRepository: DocumentRepository;
            languageConfigsService: LanguageConfigsService
        }
    ) {

        this.sourceDocuments$ = config.documentRepository.collection$.pipe(
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
                            document.name,
                            config.settingsService,
                            config.languageConfigsService
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

        const getDocumentTabulation = <T>(mapFn: (d: OpenDocument) => Observable<T>, nodeLabel: string) => {
            return this.openDocumentTree.mapWith(mapFn)
                .updates$.pipe(
                    switchMap(({sourced}) => {
                        const sourceDocuments = sourced?.children?.[nodeLabel];
                        const documentTabulations: Observable<T>[] = flattenTree<Observable<T>>(sourceDocuments);
                        return combineLatest(documentTabulations);
                    }),
                );
        }

        this.displayDocumentTabulation$ = getDocumentTabulation(document => document.renderedTabulation$, READING_DOCUMENT_NODE_LABEL)
            .pipe(
                map((documentTabulations: TabulatedDocuments[]) =>
                    mergeTabulations(...documentTabulations),
                ),
                shareReplay(1)
            );

        this.virtualDocumentTabulation$ = getDocumentTabulation(document => document.virtualTabulation$, SOURCE_DOCUMENTS_NODE_LABEL)
            .pipe(
                map((documentTabulations: SerializedDocumentTabulation[]) =>
                    new SerializedTabulationAggregate(documentTabulations)
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