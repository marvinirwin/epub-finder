import {combineLatest, merge, Observable, of, ReplaySubject} from "rxjs";
import {map, shareReplay, startWith, switchMap} from "rxjs/operators";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {Dictionary, flatten} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree, NamedDeltaScanner} from "../Tree/DeltaScanner";
import {DocumentWordData, TextWordData} from "../Atomized/TextWordData";
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
import { getDocumentWordData } from "../DocumentFrame/atomized-document-stats.service";


export type Named = {
    name: string;
}

export const SOURCE_DOCUMENTS_NODE_LABEL = 'libraryDocuments';
export const CHARACTER_DOCUMENT_NODE_LABEL = 'CharacterPageDocument';
export const READING_DOCUMENT_NODE_LABEL = 'readingDocument';
export const isWebsite = (variableToCheck: any): variableToCheck is Website =>
    (variableToCheck as Website).url !== undefined;
export const isCustomDocument = (variableToCheck: any): variableToCheck is BasicDocument =>
    (variableToCheck as BasicDocument).html !== undefined;

export class OpenDocumentsService {
    openDocumentTree = new NamedDeltaScanner<OpenDocument, string>();
    // Rendered means that their atomizedSentences exist, but aren't necessarily in the viewport
    renderedAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>;
    renderedSentenceTextDataTree$: DeltaScanner<Observable<DocumentWordData[]>>;
    renderedDocumentSentenceData$: Observable<DocumentWordData[]>;
    exampleSentenceSentenceData$: Observable<TextWordData[]>;
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
            bottomNavigationValue$: ReplaySubject<NavigationPages>,
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
                                    getDocumentWordData(sentence.getTextWordData(trie.t, trie.getUniqueLengths()), documentFrame.name)
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

        this.renderedSentenceTextDataTree$ = this
            .openDocumentTree
            .mapWith(documentDataMap());


        this.renderedElements$ = this.renderedSentenceTextDataTree$.updates$
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


        this.renderedDocumentSentenceData$ = this.renderedSentenceTextDataTree$
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    const readingFrames = sourced?.children?.[READING_DOCUMENT_NODE_LABEL];
                    return combineLatest(readingFrames ? flattenTree<Observable<DocumentWordData[]>>(readingFrames) : []);
                }),
                map((v: DocumentWordData[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        this.exampleSentenceSentenceData$ = this.renderedSentenceTextDataTree$
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    const readingFrames = sourced?.children?.[CHARACTER_DOCUMENT_NODE_LABEL];
                    return combineLatest(readingFrames ? flattenTree<Observable<TextWordData[]>>(readingFrames) : [])
                }),
                map((v: TextWordData[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        const visibleOpenDocument = <U, T extends Observable<U>>(o$: Observable<[DeltaScan<T>, NavigationPages]>): Observable<U[]> => {
            return o$.pipe(switchMap(([{sourced}, bottomNavigationValue]) => {
                if (!sourced?.children) {
                    throw new Error("OpenedDocuments has no tree, this should not happen")
                }
                switch (bottomNavigationValue) {
                    case NavigationPages.READING_PAGE:
                        const child = sourced.children[READING_DOCUMENT_NODE_LABEL];
                        return combineLatest(child ? flattenTree(child) : []);
                    case NavigationPages.QUIZ_PAGE:
                        const child1 = sourced.children[CHARACTER_DOCUMENT_NODE_LABEL];
                        return combineLatest(child1 ? flattenTree(child1) : []);
                    default:
                        return combineLatest([]);
                }
            }));
        }

        const visibleOpenedDocumentData$: Observable<TextWordData[][]> = combineLatest([
            this.renderedSentenceTextDataTree$.updates$,
            config.bottomNavigationValue$
        ]).pipe(
            visibleOpenDocument,
            shareReplay(1)
        );


        this.visibleAtomizedSentences$ = combineLatest([
            this.openDocumentTree.mapWith(openDocument => openDocument.renderedSentences$).updates$,
            config.bottomNavigationValue$
        ]).pipe(
            visibleOpenDocument,
            map((atomizedSentenceDictionaries: ds_Dict<AtomizedSentence[]>[]) => {
                return mergeDictArrays(...atomizedSentenceDictionaries);
            }),
            shareReplay(1)
        )


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