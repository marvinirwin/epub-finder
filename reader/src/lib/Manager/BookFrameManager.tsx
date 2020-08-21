import {combineLatest, Observable, Subject} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {BookFrameManagerConfig} from "./BookFrameManager/BookFrameManagerConfig";
import { flattenDeep } from "lodash";
import {DeltaScanner, ds_Dict, ds_Tree, flattenTree} from "../Util/DeltaScanner";


export class BookFrameManager {
    bookFrames = new DeltaScanner<BookFrame, 'characterPage' | 'readingPages' | string>();
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
                        sourced: ds_Tree<Observable<ds_Dict<AtomizedSentence>>> | undefined
                    }
                ) =>
                    combineLatest(sourced ? flattenTree(sourced) : [])),
                map((atomizedSentenceArrays: ds_Dict<AtomizedSentence>[]) =>
                    flattenDeep(atomizedSentenceArrays.map(Object.values))
                )
            )
    }

}