import {combineLatest, Observable, of, ReplaySubject} from "rxjs";
import {map, shareReplay, startWith, switchMap, withLatestFrom} from "rxjs/operators";
import {getBookWordData, OpenBook} from "../BookFrame/OpenBook";
import {CustomDocument, Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {Dictionary, flatten} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree, NamedDeltaScanner} from "../Tree/DeltaScanner";
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


export type Named = {
    name: string;
}

export const SOURCE_BOOKS_NODE_LABEL = 'libraryBooks';
export const CHARACTER_BOOK_NODE_LABEL = 'CharacterPageBook';
export const READING_BOOK_NODE_LABEL = 'readingBook';
export const isWebsite = (variableToCheck: any): variableToCheck is Website =>
    (variableToCheck as Website).url !== undefined;
export const isCustomDocument = (variableToCheck: any): variableToCheck is CustomDocument =>
    (variableToCheck as CustomDocument).html !== undefined;

export class OpenBooksService {
    openBookTree = new NamedDeltaScanner<OpenBook, string>();
    // Rendered means that their atomizedSentences exist, but aren't necessarily in the viewport
    renderedAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>;
    renderedSentenceTextDataTree$: DeltaScanner<Observable<BookWordData[]>>;
    renderedBookSentenceData$: Observable<BookWordData[]>;
    exampleSentenceSentenceData$: Observable<TextWordData[]>;
    displayDocument$: Observable<AtomizedDocument>;
    readingBook$ = new ReplaySubject<OpenBook>(1);
    checkedOutBooks$: Observable<ds_Dict<OpenBook>>;
    checkedOutBooksData$: Observable<AtomizedDocumentBookStats[]>;
    // Visible means inside of the viewport
    visibleElements$: Observable<Dictionary<IAnnotatedCharacter[]>>;
    visibleAtomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>;
    readingBookService: ReadingBookService;

    constructor(
        private config: {
            trie$: TrieObservable,
            applyListeners: (b: HTMLDocument) => void,
            bottomNavigationValue$: ReplaySubject<NavigationPages>,
            applyWordElementListener: (annotationElement: IAnnotatedCharacter) => void;
            db: DatabaseService;
            settingsService: SettingsService;
            library$: Observable<ds_Dict<CustomDocument | Website>>
        }
    ) {

        this.checkedOutBooks$ = combineLatest([
            config.library$.pipe(
                map(libraryBooks => {
                    return Object.fromEntries(Object.entries(libraryBooks).map(([name, page]) => {
                        if (isCustomDocument(page)) {
                            const openBook = new OpenBook(
                                page.name,
                                config.trie$,
                                undefined,
                            );
                            openBook.unAtomizedSrcDoc$.next(page.html)
                            return [
                                name,
                                openBook
                            ];
                        } else if (isWebsite(page)) {
                            const b = new OpenBook(
                                page.name,
                                config.trie$,
                                undefined,
                            );
                            b.url$.next(page.url);
                            return [name, b];
                        }
                        throw new Error("Unknown addOpenBook ");
                    })) as ds_Dict<OpenBook>
                })
            ),
            config.settingsService.checkedOutBooks$
        ]).pipe(map(([library, checkedOutBookTitles]) => {
                return Object.fromEntries(
                    Object.entries(library).filter(([title, book]) => checkedOutBookTitles[title])
                )
            }),
            shareReplay(1)
        );

/*
        this.checkedOutBooks$.pipe(
            switchMap(checkedOutBooksDict => combineLatest(Object.values(checkedOutBooksDict).map(b => b.renderedSentences$)))
        ).subscribe((atomizedSentenceGroups) => {
            atomizedSentenceGroups.forEach(sentences => config.applyAtomizedSentencesListener(flatten(Object.values(sentences))));
        })
*/

        this.checkedOutBooks$.subscribe(
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
            .mapWith((bookFrame: OpenBook) => bookFrame.renderedSentences$).updates$.pipe(
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

        this.checkedOutBooksData$ = this.checkedOutBooks$.pipe(
            switchMap(openBooks =>
                combineLatest(Object.values(openBooks).map(book => book.bookStats$))
            )
        )

        this.renderedSentenceTextDataTree$ = this
            .openBookTree
            .mapWith(bookDataMap());
        this.renderedSentenceTextDataTree$.updates$.subscribe(({delta}) => {
            combineLatest(flattenTree(delta))
                .subscribe(bookStats => {
                    bookStats.forEach(atomizedSentenceStats => {
                        atomizedSentenceStats.forEach(sentenceStats => {
                            flatten(Object.values(sentenceStats.wordElementsMap)).forEach(config.applyWordElementListener)
                        })
                    })
                })
        });


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

        this.readingBookService = new ReadingBookService({
            trie$: config.trie$,
            openBooks$: this.checkedOutBooks$,
            // TODO make a variable which contains the current reading book,
            //  right now I only have a list of checked out books (Which should be renamed openBooks)
            selectedBook$: config.settingsService.checkedOutBooks$.pipe(
                map(checkedOutBooks => Object.keys(checkedOutBooks)[0]),
                shareReplay(1)
            )
        })
        this.openBookTree.appendDelta$.next(
            {
                nodeLabel: 'root',
                children: {
                    [READING_BOOK_NODE_LABEL]: {
                        nodeLabel: READING_BOOK_NODE_LABEL,
                        children: {
                            [this.readingBookService.readingBook.name]: {
                                nodeLabel: this.readingBookService.readingBook.name,
                                value: this.readingBookService.readingBook
                            }
                        }
                    }
                }
            }
        );


    }

    private applyListenersToOpenedBookBodies() {
        this.openBookTree.updates$.subscribe(({delta}) => {
            flattenTree(delta).forEach(newOpenedBook => newOpenedBook.renderRoot$.subscribe(root => this.config.applyListeners(root.ownerDocument as HTMLDocument)))
        })
    }
}