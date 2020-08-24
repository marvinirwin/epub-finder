import {combineLatest, Observable, Subject} from "rxjs";
import {map, shareReplay, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {OpenBook} from "../BookFrame/OpenBook";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {BookFrameManagerConfig} from "./BookFrameManager/BookFrameManagerConfig";
import {flattenDeep} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree} from "../Util/DeltaScanner";

export class OpenBookManager {
    openedBooks = new DeltaScanner<OpenBook, 'characterPageFrame' | 'readingFrames' | string>();
    atomizedSentences$: Observable<AtomizedSentence[]>;
    addOpenBook$ = new Subject<Website>();

    constructor(
        private config: BookFrameManagerConfig
    ) {
        this.addOpenBook$
            .pipe(switchMap(page => {
                return this.config.getPageRenderer(page);
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

        this.atomizedSentences$ = this.openedBooks
            .mapWith((bookFrame: OpenBook) => bookFrame.renderer.atomizedSentences$.obs$).updates$.pipe(
                switchMap(({sourced}: DeltaScan<Observable<ds_Dict<AtomizedSentence, string>>>) => {
                    let sources = sourced ? flattenTree(sourced) : [];
                    let observable = combineLatest(sources);
                    observable.subscribe(args => {
                        console.log();
                    })
                    return observable.pipe(
                        tap(() => {
                            console.log();
                        })
                    );
                }),
                map((atomizedSentenceArrays: ds_Dict<AtomizedSentence>[]) => {
                        return flattenDeep(atomizedSentenceArrays.map(Object.values));
                    }
                ),
                shareReplay(1)
            );


        this.atomizedSentences$.subscribe(() => {
            console.log();
        });
        console.log();
    }
}