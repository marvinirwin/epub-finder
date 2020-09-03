import {combineLatest, Observable, Subject} from "rxjs";
import {map, shareReplay, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {OpenBook} from "../BookFrame/OpenBook";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {OpenBooksConfig} from "./BookFrameManager/OpenBooksConfig";
import {Dictionary, flatten, flattenDeep} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree} from "../Util/DeltaScanner";
import {TextWordData} from "../Atomized/TextWordData";
import {TrieWrapper} from "../TrieWrapper";
import {NavigationPages} from "../Util/Util";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {mergeDictArrays} from "../Util/mergeAnnotationDictionary";

export class OpenBooks {
    openedBooks = new DeltaScanner<OpenBook, 'characterPageFrame' | 'readingFrames' | string>();
    atomizedSentences$: Observable<AtomizedSentence[]>;
    addOpenBook$ = new Subject<Website>();
    openBookTextDataTree$: DeltaScanner<Observable<TextWordData[]>>;
    exampleSentenceSentenceData$: Observable<TextWordData[]>;
    sourceBookSentenceData$: Observable<TextWordData[]>;
    visibleElements$: Observable<Dictionary<IAnnotatedCharacter[]>>;

    constructor(
        private config: OpenBooksConfig
    ) {
        this.addOpenBook$
            .pipe(map(page => {
                const b = new OpenBook(page.name, config.trie$);
                b.url$.next(page.url)
                return b;
            }))
            .subscribe(openBook => {
                this.openedBooks.appendDelta$.next(
                    {
                        nodeLabel: 'root',
                        children: {
                            'readingFrames': {
                                nodeLabel: 'readingFrames',
                                children: {
                                    [openBook.name]: {
                                        nodeLabel: openBook.name,
                                        value: openBook
                                    }
                                }
                            }
                        }
                    }
                )
            });

        this.applyListenersToOpenedBookBodies();

        this.atomizedSentences$ = this.openedBooks
            .mapWith((bookFrame: OpenBook) => bookFrame.renderedSentences$).updates$.pipe(
                switchMap(({sourced}: DeltaScan<Observable<ds_Dict<AtomizedSentence>>>) => {
                    return combineLatest(
                        sourced ? flattenTree(sourced) : []
                    );
                }),
                map((atomizedSentenceArrays: ds_Dict<AtomizedSentence>[]) => {
                        return flattenDeep(atomizedSentenceArrays.map(Object.values));
                    }
                ),
                shareReplay(1)
            );

        this.openBookTextDataTree$ = this
            .openedBooks
            .mapWith(bookFrame => {
                    return bookFrame
                        .renderedSentences$
                        .pipe(
                            withLatestFrom(config.trie$),
                            map(([sentences, trie]: [ds_Dict<AtomizedSentence>, TrieWrapper]) => {
                                    return Object.entries(sentences).map(([sentenceStr, sentence]) =>
                                        sentence.getTextWordData(trie.t, trie.getUniqueLengths())
                                    );
                                }
                            ),
                            shareReplay(1)
                        );
                }
            );
        this.openBookTextDataTree$.updates$.subscribe(({delta}) => {
            flattenTree(delta)
                .forEach(
                    textData => textData.subscribe(
                        textDatas => textDatas.forEach(datum => flatten(
                            Object.values(datum.wordElementsMap)
                            ).forEach(config.applyWordElementListener)
                        )
                    )
                )
        })
        this.sourceBookSentenceData$ = this.openBookTextDataTree$
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    let readingFrames = sourced?.children?.['readingFrames'];
                    return combineLatest(readingFrames ? flattenTree<Observable<TextWordData[]>>(readingFrames) : []);
                }),
                map((v: TextWordData[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        this.exampleSentenceSentenceData$ = this.openBookTextDataTree$
            .updates$.pipe(
                switchMap(({sourced}) => {
                    // I only want the tree from 'readingFrames'
                    let readingFrames = sourced?.children?.['characterPageFrame'];
                    return combineLatest(readingFrames ? flattenTree<Observable<TextWordData[]>>(readingFrames) : [])
                }),
                map((v: TextWordData[][]) => {
                    return flatten(v);
                }),
                shareReplay(1)
            );

        let visibleOpenedBookData$: Observable<TextWordData[][]> = combineLatest([
            this.openBookTextDataTree$.updates$,
            config.bottomNavigationValue$
        ]).pipe(
            switchMap(([{sourced}, bottomNavigationValue]) => {
                if (!sourced?.children) {
                    throw new Error("OpenedBooks has no tree, this should not happen")
                }
                switch (bottomNavigationValue) {
                    case NavigationPages.READING_PAGE:
                        let child = sourced.children['readingFrames'];
                        return combineLatest(child ? flattenTree(child) : []);
                    case NavigationPages.QUIZ_PAGE:
                        let child1 = sourced.children['characterPageFrame'];
                        return combineLatest(child1 ? flattenTree(child1) : []);
                    default:
                        return combineLatest([]);
                }
            }),
            shareReplay(1)
        );

        this.visibleElements$ = visibleOpenedBookData$.pipe(
            map(flatten),
            map(sentenceData =>
                mergeDictArrays(...sentenceData.map(sentenceDatum => sentenceDatum.wordElementsMap))
            ),
            shareReplay(1)
        );
    }

    private applyListenersToOpenedBookBodies() {
        this.openedBooks.updates$.subscribe(({delta}) => {
            flattenTree(delta).forEach(newOpenedBook => newOpenedBook.renderRoot$.subscribe(this.config.applyListeners))
        })
    }
}