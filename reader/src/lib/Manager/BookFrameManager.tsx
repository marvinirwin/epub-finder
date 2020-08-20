import {merge, Observable, Subject} from "rxjs";
import {Dictionary, flatten} from "lodash";
import {map, scan, shareReplay, switchMap} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {InputManager} from "./InputManager";
import {BookFrameManagerConfig} from "./BookFrameManager/BookFrameManagerConfig";

export class BookFrameManager {
    bookFrames$: Observable<Dictionary<BookFrame>>
    bookFrameList$: Observable<BookFrame[]>;
    atomizedSentences$: Observable<AtomizedSentence[]>;
    addPage$ = new Subject<Website>();

    constructor(
        private config: BookFrameManagerConfig
    ) {
        this.bookFrames$ = this.addPage$.pipe(
            switchMap(page => {
                    return this.config.getPageRenderer(page);
                }
            ),
            scan((acc: Dictionary<BookFrame>, page: BookFrame) => {
                acc[page.name] = page;
                return acc;
            }, {}),
            shareReplay(1)
        );

        this.bookFrameList$ = this.bookFrames$.pipe(
            map(pageIndex => Object.values(pageIndex)),
            shareReplay(1)
        );

        this.atomizedSentences$ = this.bookFrameList$.pipe(
            switchMap(pageList => merge(
                ...pageList.map(bookFrame => bookFrame.renderer.atomizedSentences$.pipe(
                    map(atomizedSentences => Object.values(atomizedSentences))
                    )
                )
                ).pipe(map(flatten))
            )
        );

        this.bookFrameList$.pipe(
            switchMap(pageList =>
                merge(...pageList.map(page => page.renderer.atomizedSentences$))
            ),
        ).subscribe(atomizedSentences => {
            InputManager.applyAtomizedSentencePopperListeners(Object.values(atomizedSentences));
        })
    }

}