import {combineLatest, merge, Observable, of, ReplaySubject} from "rxjs";
import {map, shareReplay, startWith, switchMap} from "rxjs/operators";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {Dictionary, flatten} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree, NamedDeltaScanner} from "../Tree/DeltaScanner";
import {TrieWrapper} from "../TrieWrapper";
import {NavigationPages} from "../Util/Util";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {AtomizedDocumentDocumentStats} from "../Atomized/AtomizedDocumentStats";
import {TrieObservable} from "./QuizCharacter";
import {DatabaseService} from "../Storage/database.service";
import {SettingsService} from "../../services/settings.service";
import {BasicDocument} from "../../types";
import {filterMap, mapMap, mapToArray} from "../map.module";
import {LibraryService} from "./library.service";
import {OpenDocument} from "../DocumentFrame/open-document.entity";
import {AtomizedDocumentSources, DocumentSourcesService} from "../DocumentFrame/document-sources.service";
import {getTextWordData} from "../DocumentFrame/atomized-document-stats.service";
import {DocumentDataIndex} from "../Atomized/document-data-index.interfaec";


export type Named = {
    name: string;
}

export const SOURCE_DOCUMENTS_NODE_LABEL = 'libraryDocuments';
export const EXAMPLE_SENTENCE_DOCUMENT = 'CharacterPageDocument';
export const READING_DOCUMENT_NODE_LABEL = 'readingDocument';
export const isWebsite = (variableToCheck: any): variableToCheck is Website =>
    (variableToCheck as Website).url !== undefined;
export const isCustomDocument = (variableToCheck: any): variableToCheck is BasicDocument =>
    (variableToCheck as BasicDocument).html !== undefined;

export class OpenDocumentsService {
    openDocumentTree = new NamedDeltaScanner<OpenDocument, string>();
    // Rendered means that their atomizedSentences exist, but aren't necessarily in the viewport
    renderedAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>;
    renderedDocumentDataTree: DeltaScanner<Observable<DocumentDataIndex[]>>;
    sourceDocumentSentenceData$: Observable<DocumentDataIndex[]>;
    exampleSentenceSentenceData$: Observable<DocumentDataIndex[]>;
    displayDocument$: Observable<AtomizedDocument>;
    readingDocument$ = new ReplaySubject<OpenDocument>(1);
    allReadingDocuments: Observable<Map<string, OpenDocument>>;
    checkedOutDocumentsData$: Observable<AtomizedDocumentDocumentStats[]>;
    // Visible means inside of the viewport
    visibleElements$: Observable<Dictionary<IAnnotatedCharacter[]>>;
    visibleAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>;
    newOpenDocumentDocumentBodies$: Observable<HTMLBodyElement>;
    renderedElements$: Observable<IAnnotatedCharacter[]>;

    constructor(
        private config: {
            trie$: TrieObservable,
            db: DatabaseService;
            settingsService: SettingsService;
            libraryService: LibraryService;
        }
    ) {

        this.allReadingDocuments = config.libraryService.documents$.pipe(
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

        this.allReadingDocuments.subscribe(
            openDocuments => this.openDocumentTree.appendDelta$.next(
                {
                    nodeLabel: 'root',
                    children: {
                        [SOURCE_DOCUMENTS_NODE_LABEL]: {
                            nodeLabel: SOURCE_DOCUMENTS_NODE_LABEL,
                            children: Object.fromEntries(
                                Object.entries(openDocuments)
                                    .map(([name, openDocument]) => [
                                            name,
                                            {
                                                value: openDocument,
                                                nodeLabel: name
                                            }
                                        ]
                                    )
                            )
                        }
                    },
                }
            )
        )


        this.renderedAtomizedSentences$ = this.openDocumentTree
            .mapWith((documentFrame: OpenDocument) => documentFrame.renderedSentences$.pipe(startWith({}))).updates$.pipe(
                switchMap(({sourced}) => {
                    const sources = sourced ? flattenTree(sourced) : [];
                    return combineLatest(sources);
                }),
                map((atomizedSentenceArrays) =>
                    mergeDictArrays(...atomizedSentenceArrays)
                ),
                shareReplay(1)
            );


        function documentDataMap() {
            return (documentFrame: OpenDocument) => {
                return combineLatest([
                    documentFrame.renderedSentences$,
                    config.trie$
                ]).pipe(
                    map(([sentences, trie]: [ds_Dict<AtomizedSentence[]>, TrieWrapper]) => {
                            return flatten(Object.entries(sentences).map(([sentenceStr, sentences]) =>
                                sentences.map(sentence =>
                                    getTextWordData(
                                        sentence.getTextWordData(trie.t, trie.getUniqueLengths()),
                                        documentFrame.name
                                    )
                                )
                            ));
                        }
                    ),
                    shareReplay(1),
                );
            };
        }

        this.checkedOutDocumentsData$ = this.allReadingDocuments.pipe(
            switchMap(openDocuments =>
                combineLatest(mapToArray(openDocuments, (id, document) => document.documentStats$))
            ),
            shareReplay(1)
        )

        this.renderedDocumentDataTree = this
            .openDocumentTree
            .mapWith(documentDataMap());


        this.renderedElements$ = this.renderedDocumentDataTree.updates$
            .pipe(
                switchMap(({sourced}) => {
                    return merge(...flattenTree(sourced));
                }),
                map(documentWordDatas => {
                        return Array.from(
                            new Set(
                                flatten(
                                    documentWordDatas.map(d => flatten(Object.values(d.wordElementsMap)))
                                )
                            ));
                    }
                ),
                shareReplay(1)
                /*
                                map((annotatedCharacters: IAnnotatedCharacter[]) =>
                                    annotatedCharacters.map(({element}) => element as unknown as HTMLElement)
                                )
                */
            )


        this.sourceDocumentSentenceData$ = this.renderedDocumentDataTree
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    const readingFrames = sourced?.children?.[READING_DOCUMENT_NODE_LABEL];
                    return combineLatest(readingFrames ? flattenTree<Observable<DocumentDataIndex[]>>(readingFrames) : []);
                }),
                map((v: DocumentDataIndex[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        this.exampleSentenceSentenceData$ = this.renderedDocumentDataTree
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    const readingFrames = sourced?.children?.[EXAMPLE_SENTENCE_DOCUMENT];
                    return combineLatest(readingFrames ? flattenTree<Observable<DocumentDataIndex[]>>(readingFrames) : [])
                }),
                map((v: DocumentDataIndex[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        this.visibleElements$ = visibleOpenedDocumentData$.pipe(
            map(flatten),
            map(sentenceData =>
                mergeDictArrays(...sentenceData.map(sentenceDatum => sentenceDatum.wordElementsMap))
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
            )
    }

}