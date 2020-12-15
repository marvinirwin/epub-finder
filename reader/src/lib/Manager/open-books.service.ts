import {combineLatest, merge, Observable, of, ReplaySubject} from "rxjs";
import {map, shareReplay, startWith, switchMap} from "rxjs/operators";
import {getBookWordData, OpenBook} from "../BookFrame/OpenBook";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {Dictionary, flatten} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree, IndexedByNumber, NamedDeltaScanner} from "../Tree/DeltaScanner";
import {BookWordData, TextWordData} from "../Atomized/TextWordData";
import {TrieWrapper} from "../TrieWrapper";
import {NavigationPages} from "../Util/Util";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {AtomizedDocumentBookStats} from "../Atomized/AtomizedDocumentStats";
import {TrieObservable} from "./QuizCharacter";
import {DatabaseService} from "../Storage/database.service";
import {ReadingBookService} from "./reading-book.service";
import {SettingsService} from "../../services/settings.service";
import {BasicDocument} from "../../types";
import {BookViewDto} from "@server/*";
import {filterMap, mapMap, mapToArray} from "../map.module";
import {LibraryService} from "./library.service";


export type Named = {
    name: string;
}

export const SOURCE_BOOKS_NODE_LABEL = 'libraryBooks';
export const CHARACTER_BOOK_NODE_LABEL = 'CharacterPageBook';
export const READING_BOOK_NODE_LABEL = 'readingBook';
export const isWebsite = (variableToCheck: any): variableToCheck is Website =>
    (variableToCheck as Website).url !== undefined;
export const isCustomDocument = (variableToCheck: any): variableToCheck is BasicDocument =>
    (variableToCheck as BasicDocument).html !== undefined;

export class OpenBooksService {
    openBookTree = new NamedDeltaScanner<OpenBook, string>();
    // Rendered means that their atomizedSentences exist, but aren't necessarily in the viewport
    renderedAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>;
    renderedSentenceTextDataTree$: DeltaScanner<Observable<BookWordData[]>>;
    renderedBookSentenceData$: Observable<BookWordData[]>;
    exampleSentenceSentenceData$: Observable<TextWordData[]>;
    displayDocument$: Observable<AtomizedDocument>;
    readingBook$ = new ReplaySubject<OpenBook>(1);
    allOpenBooks$: Observable<Map<number, OpenBook>>;
    checkedOutBooksData$: Observable<AtomizedDocumentBookStats[]>;
    // Visible means inside of the viewport
    visibleElements$: Observable<Dictionary<IAnnotatedCharacter[]>>;
    visibleAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>;
    newOpenBookDocumentBodies$: Observable<HTMLBodyElement>;
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

        this.allOpenBooks$ = config.libraryService.documents$.pipe(
            map(documents => filterMap(documents, (key, d) => !d.deleted)),
            map(libraryBooks => {
                return mapMap(
                    libraryBooks,
                    (id, bookViewDto) => {
                        const openBook = new OpenBook(
                            bookViewDto.name,
                            config.trie$,
                            undefined,
                        );
                        openBook.unAtomizedSrcDoc$.next(bookViewDto.html);
                        return [
                            id,
                            openBook
                        ];
                    }
                )
            })
        ).pipe(
            shareReplay(1)
        );

        this.allOpenBooks$.subscribe(
            openBooks => this.openBookTree.appendDelta$.next(
                {
                    nodeLabel: 'root',
                    children: {
                        [SOURCE_BOOKS_NODE_LABEL]: {
                            nodeLabel: SOURCE_BOOKS_NODE_LABEL,
                            children: Object.fromEntries(
                                Object.entries(openBooks)
                                    .map(([name, openBook]) => [
                                            name,
                                            {
                                                value: openBook,
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

        this.applyListenersToOpenedBookBodies();

        this.renderedAtomizedSentences$ = this.openBookTree
            .mapWith((bookFrame: OpenBook) => bookFrame.renderedSentences$.pipe(startWith({}))).updates$.pipe(
                switchMap(({sourced}) => {
                    const sources = sourced ? flattenTree(sourced) : [];
                    return combineLatest(sources);
                }),
                map((atomizedSentenceArrays) =>
                    mergeDictArrays(...atomizedSentenceArrays)
                ),
                shareReplay(1)
            );


        function bookDataMap() {
            return (bookFrame: OpenBook) => {
                return combineLatest([
                    bookFrame.renderedSentences$,
                    config.trie$
                ]).pipe(
                    map(([sentences, trie]: [ds_Dict<AtomizedSentence[]>, TrieWrapper]) => {
                            return flatten(Object.entries(sentences).map(([sentenceStr, sentences]) =>
                                sentences.map(sentence =>
                                    getBookWordData(sentence.getTextWordData(trie.t, trie.getUniqueLengths()), bookFrame.name)
                                )
                            ));
                        }
                    ),
                    shareReplay(1)
                );
            };
        }

        this.checkedOutBooksData$ = this.allOpenBooks$.pipe(
            switchMap(openBooks =>
                combineLatest(mapToArray(openBooks, (id, book) => book.bookStats$))
            )
        )

        this.renderedSentenceTextDataTree$ = this
            .openBookTree
            .mapWith(bookDataMap());


        this.renderedElements$ = this.renderedSentenceTextDataTree$.updates$
            .pipe(
                switchMap(({delta}) => merge(...flattenTree(delta))),
                map(bookWordDatas => Array.from(
                    new Set(
                        flatten(
                            bookWordDatas.map(d => flatten(Object.values(d.wordElementsMap)))
                        )
                    ))
                ),
/*
                map((annotatedCharacters: IAnnotatedCharacter[]) =>
                    annotatedCharacters.map(({element}) => element as unknown as HTMLElement)
                )
*/
            )


        this.renderedBookSentenceData$ = this.renderedSentenceTextDataTree$
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    const readingFrames = sourced?.children?.[READING_BOOK_NODE_LABEL];
                    return combineLatest(readingFrames ? flattenTree<Observable<BookWordData[]>>(readingFrames) : []);
                }),
                map((v: BookWordData[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        this.exampleSentenceSentenceData$ = this.renderedSentenceTextDataTree$
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    const readingFrames = sourced?.children?.[CHARACTER_BOOK_NODE_LABEL];
                    return combineLatest(readingFrames ? flattenTree<Observable<TextWordData[]>>(readingFrames) : [])
                }),
                map((v: TextWordData[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        const visibleOpenBook = <U, T extends Observable<U>>(o$: Observable<[DeltaScan<T>, NavigationPages]>): Observable<U[]> => {
            return o$.pipe(switchMap(([{sourced}, bottomNavigationValue]) => {
                if (!sourced?.children) {
                    throw new Error("OpenedBooks has no tree, this should not happen")
                }
                switch (bottomNavigationValue) {
                    case NavigationPages.READING_PAGE:
                        const child = sourced.children[READING_BOOK_NODE_LABEL];
                        return combineLatest(child ? flattenTree(child) : []);
                    case NavigationPages.QUIZ_PAGE:
                        const child1 = sourced.children[CHARACTER_BOOK_NODE_LABEL];
                        return combineLatest(child1 ? flattenTree(child1) : []);
                    default:
                        return combineLatest([]);
                }
            }));
        }

        const visibleOpenedBookData$: Observable<TextWordData[][]> = combineLatest([
            this.renderedSentenceTextDataTree$.updates$,
            config.bottomNavigationValue$
        ]).pipe(
            visibleOpenBook,
            shareReplay(1)
        );


        this.visibleAtomizedSentences$ = combineLatest([
            this.openBookTree.mapWith(openBook => openBook.renderedSentences$).updates$,
            config.bottomNavigationValue$
        ]).pipe(
            visibleOpenBook,
            map((atomizedSentenceDictionaries: ds_Dict<AtomizedSentence[]>[]) => {
                return mergeDictArrays(...atomizedSentenceDictionaries);
            })
        )


        this.visibleElements$ = visibleOpenedBookData$.pipe(
            map(flatten),
            map(sentenceData =>
                mergeDictArrays(...sentenceData.map(sentenceDatum => sentenceDatum.wordElementsMap))
            ),
            shareReplay(1)
        );


        this.displayDocument$ = this.readingBook$.pipe(
            switchMap(readingBook => {
                if (!readingBook) return of<AtomizedDocument>();
                return readingBook.atomizedDocument$;
            }),
            shareReplay(1)
        );


        this.newOpenBookDocumentBodies$ = this.openBookTree
            .mapWith(r => r.renderRoot$)
            .updates$
            .pipe(
                switchMap(({delta}) => merge(...flattenTree(delta))),
                shareReplay(1)
            )
        /*
                    .subscribe(({delta}) => {
                    .
                        forEach(newOpenedBook => newOpenedBook.renderRoot$.subscribe(root => this.config.applyListeners(root.ownerDocument as HTMLDocument)))
                    })
        */

    }

    private applyListenersToOpenedBookBodies() {
    }
}