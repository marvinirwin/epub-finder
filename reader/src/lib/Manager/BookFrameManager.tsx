import {combineLatest, Observable, Subject} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {BookFrameManagerConfig} from "./BookFrameManager/BookFrameManagerConfig";
import { flattenDeep } from "lodash";
import { DeltaScanner } from "../Util/DeltaScanner";


export class BookFrameManager {
    bookFrames = new DeltaScanner.DeltaScanner<BookFrame, 'characterPage' | 'readingPages' | string>();
    atomizedSentences$: Observable<AtomizedSentence[]>;
    addReadingBookFrame$ = new Subject<Website>();

    constructor(
        private config: BookFrameManagerConfig
    ) {
        this.addReadingBookFrame$.pipe(switchMap(page => this.config.getPageRenderer(page)))
            .subscribe(newBookFrame => {
                this.bookFrames.appendDelta$.next({
                    nodeLabel: 'root',
                    children: {
                        [newBookFrame.name]: {
                            nodeLabel: newBookFrame.name,
                            value: newBookFrame
                        }
                    }
                })
            });
        this.atomizedSentences$ = this.bookFrames
            .mapWith((bookFrame: BookFrame) => bookFrame.renderer.atomizedSentences$)
            .updates$.pipe(
                switchMap((
                    {
                        sourced
                    }: {
                        sourced: DeltaScanner.Tree<Observable<DeltaScanner.Dict<AtomizedSentence>>> | undefined
                    }
                ) =>
                    combineLatest(sourced ? DeltaScanner.flattenTree(sourced) : [])),
                map((atomizedSentenceArrays: DeltaScanner.Dict<AtomizedSentence>[]) =>
                    flattenDeep(atomizedSentenceArrays.map(Object.values))
                )
            )
    }

}