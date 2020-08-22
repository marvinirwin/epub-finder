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

        let deltaScanner = this.bookFrames.mapWith((bookFrame: BookFrame) => bookFrame.renderer.atomizedSentences$);

        let called = 0;
        let project = ({sourced}: DeltaScan<Observable<ds_Dict<AtomizedSentence, string>>>) => {
            called++;
            let v1 = sourced ? flattenTree(sourced) : [];
            v1[0].subscribe(() => {
                console.log();
            })
            if (called > 1) {
                console.log();
            }
            return combineLatest(v1).pipe(
                tap(() => {
                    console.log();
                })
            );
        };
        this.atomizedSentences$ = deltaScanner.updates$.pipe(
            switchMap(project),
            map((atomizedSentenceArrays: ds_Dict<AtomizedSentence>[]) => {
                    return flattenDeep(atomizedSentenceArrays.map(Object.values));
                }
            ),
            shareReplay(1)
        )
    }
}