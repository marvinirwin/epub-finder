import {combineLatest, Observable, Subject} from "rxjs";
import {map, shareReplay, switchMap, tap} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {BookFrameManagerConfig} from "./BookFrameManager/BookFrameManagerConfig";
import {flattenDeep} from "lodash";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree} from "../Util/DeltaScanner";


export class BookFrameManager {
    bookFrames = new DeltaScanner<BookFrame, 'characterPageFrame' | 'readingFrames' | string>();
    atomizedSentences$: Observable<AtomizedSentence[]>;
    addReadingBookFrame$ = new Subject<Website>();

    constructor(
        private config: BookFrameManagerConfig
    ) {
        this.addReadingBookFrame$
            .pipe(switchMap(page => {
                return this.config.getPageRenderer(page);
            }))
            .subscribe(newBookFrame => {
                this.bookFrames.appendDelta$.next({
                    nodeLabel: 'readingFrames',
                    children: {
                        [newBookFrame.name]: {
                            nodeLabel: newBookFrame.name,
                            value: newBookFrame
                        }
                    }
                })
            });

        let deltaScanner = this.bookFrames.mapWith((bookFrame: BookFrame) => bookFrame.renderer.atomizedSentences$.obs$);

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