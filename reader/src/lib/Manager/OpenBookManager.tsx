import {combineLatest, Observable, Subject} from "rxjs";
import {map, shareReplay, switchMap, tap} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {BookFrameManagerConfig} from "./BookFrameManager/BookFrameManagerConfig";
import {flattenDeep} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree} from "../Util/DeltaScanner";


export class OpenBookManager {
    openedBooks = new DeltaScanner<BookFrame, 'characterPageFrame' | 'readingFrames' | string>();
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
                this.openedBooks.appendDelta$.next({
                    nodeLabel: 'readingFrames',
                    children: {
                        [openBook.name]: {
                            nodeLabel: openBook.name,
                            value: openBook
                        }
                    }
                })
            });

        let deltaScanner = this.openedBooks.mapWith((bookFrame: BookFrame) => bookFrame.renderer.atomizedSentences$.obs$);

        this.atomizedSentences$ = deltaScanner.updates$.pipe(
            switchMap(({sourced}: DeltaScan<Observable<ds_Dict<AtomizedSentence, string>>>) => {
                return combineLatest(sourced ? flattenTree(sourced) : []).pipe(
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
        })
    }
}