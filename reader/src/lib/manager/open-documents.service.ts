import { combineLatest, merge, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { SerializedDocumentTabulation, TabulatedSegments } from '@shared/'
import { flattenTree, NamedDeltaScanner } from '../delta-scan/delta-scan.module'
import { DatabaseService } from '../Storage/database.service'
import { SettingsService } from '../../services/settings.service'
import { mapMap, mapToArray } from '../util/map.module'
import { OpenDocument } from '../document-frame/open-document.entity'
import {
    AtomizedDocumentSources,
    DocumentSourcesService,
} from '../document-frame/document-sources.service'
import { DocumentRepository } from '../documents/document.repository'
import { TrieWrapper } from '../util/TrieWrapper'
import { SerializedTabulationAggregate } from "@shared/"
import { LanguageConfigsService } from '../language/language-configs.service'
import { BrowserSegment } from '../sentences/browser-segment'
import { TabulationConfigurationService } from '../language/language-maps/tabulation-configuration.service'
import { OnSelectService } from '../user-interface/on-select.service'
import { pipeLog } from './pipe.log'
import {ExampleSegmentsService} from "../quiz/example-segments.service";
import {LoadingService} from "../loading/loadingService";

export type TrieObservable = Observable<TrieWrapper>

export const SOURCE_DOCUMENTS_NODE_LABEL = 'libraryDocuments'
export const EXAMPLE_SENTENCE_DOCUMENT = 'exampleSentences'
export const READING_DOCUMENT_NODE_LABEL = 'readingDocument'

export class OpenDocumentsService {
    openDocumentTree = new NamedDeltaScanner<OpenDocument, string>()
    // Rendered means that their atomizedSentences exist, but aren't necessarily in the viewport
    displayDocumentTabulation$: Observable<TabulatedSegments[]>
    sourceDocuments$: Observable<Map<string, OpenDocument>>
    openDocumentBodies$: Observable<HTMLBodyElement>
    renderedSegments$: Observable<BrowserSegment[]>
    virtualDocumentTabulation$: Observable<SerializedTabulationAggregate>

    constructor(
        private config: {
            databaseService: DatabaseService
            settingsService: SettingsService
            documentRepository: DocumentRepository
            languageConfigsService: LanguageConfigsService
            onSelectService: OnSelectService
            tabulationConfigurationService: TabulationConfigurationService
            exampleSegmentsService: ExampleSegmentsService
            loadingService: LoadingService
        },
    ) {
        this.sourceDocuments$ = config.documentRepository.collection$.pipe(
            map((documents) => {
                return mapMap(documents, (id, document) => {
                    const documentSource: AtomizedDocumentSources = {
                        documentId: document.id()
                    }
                    if (document.filename) {
                        documentSource.url$ = of(
                            `/api/documents/${document.filename}`,
                        )
                    }
                    const openDocument = new OpenDocument(
                        document.id(),
                        config.tabulationConfigurationService,
                        DocumentSourcesService.document(documentSource),
                        document.name,
                        {
                            settingsService: config.settingsService,
                            languageConfigsService:
                                config.languageConfigsService,
                            onSelectService: config.onSelectService,
                            exampleSegmentsService: config.exampleSegmentsService,
                            loadingService: config.loadingService
                        },
                    )
                    return [id, openDocument]
                })
            }),
            shareReplay(1),
        )

        this.sourceDocuments$.subscribe((openDocuments) => {
            const children = Object.fromEntries(
                [...openDocuments.entries()].map(([name, openDocument]) => [
                    name,
                    {
                        value: openDocument,
                        nodeLabel: name,
                    },
                ]),
            )
            this.openDocumentTree.appendDelta$.next({
                nodeLabel: 'root',
                children: {
                    [SOURCE_DOCUMENTS_NODE_LABEL]: {
                        children,
                        nodeLabel: SOURCE_DOCUMENTS_NODE_LABEL,
                    },
                },
            })
        })


        const mapDocumentTree = <T>(
            mapFn: (d: OpenDocument) => Observable<T>,
            nodeLabel: string,
        ) => {
            return this.openDocumentTree.mapWith(mapFn).updates$.pipe(
                switchMap(({ sourced }) => {
                    const sourceDocuments = sourced?.children?.[nodeLabel]
                    const observables: Observable<T>[] = flattenTree<
                        Observable<T>
                    >(sourceDocuments)
                    return combineLatest(observables)
                }),
            )
        }

        this.displayDocumentTabulation$ = mapDocumentTree(
            (document) => document.renderedTabulation$,
            READING_DOCUMENT_NODE_LABEL,
        ).pipe(
            shareReplay(1),
        )

        this.virtualDocumentTabulation$ = mapDocumentTree(
            (document) => document.virtualTabulation$,
            SOURCE_DOCUMENTS_NODE_LABEL,
        ).pipe(
            pipeLog('open-documents:virtual-document-tabulation'),
            map(
                (documentTabulations: SerializedDocumentTabulation[]) =>
                    new SerializedTabulationAggregate(documentTabulations),
            ),
            shareReplay(1),
        )

        this.openDocumentBodies$ = this.openDocumentTree
            .mapWith((r) => r.renderRoot$)
            .updates$.pipe(
                switchMap(({ sourced }) => {
                    // TODO this will result in
                    return merge(...flattenTree(sourced))
                }),
                shareReplay(1),
            )
        this.renderedSegments$ = this.openDocumentTree
            .mapWith((r) => r.renderedSegments$)
            .updates$.pipe(
                switchMap(({ sourced }) => merge(...flattenTree(sourced))),
                shareReplay(1),
            )
    }
}
