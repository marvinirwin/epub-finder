import {merge, Observable} from "rxjs";
import {AtomizedSentence} from "../lib/Atomized/AtomizedSentence";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {ReadingBookService} from "../lib/Manager/reading-book.service";
import {IntersectionObserverService} from "./intersection-observer.service";
import {map, scan} from "rxjs/operators";
import {safePush} from "./safe-push";

export class VisibleSentencesService {
    visibleSentences$: Observable<ds_Dict<AtomizedSentence[]>>

    constructor({intersectionObserverService}: { intersectionObserverService: IntersectionObserverService }) {
        this.visibleSentences$ = merge(
            intersectionObserverService.newAtomizedSentenceVisible$.pipe(map(s => [s])),
            intersectionObserverService.newAtomizedSentenceHidden$.pipe(map(s => [undefined, s])),
        ).pipe(
            scan((
                visibleElementsMap: ds_Dict<AtomizedSentence[]>,
                [newVisible, newInvisible]
            ) => {
                if (newInvisible) {

                }
                if (newVisible) {
                    safePush(visibleElementsMap, newVisible.textContent, newVisible)
                }
                delete visibleElementsMap[]
                return {...visibleElementsMap}
            }, {})
        )
    }
}