import {combineLatest, Observable} from "rxjs";
import {OpenBook} from "../BookFrame/OpenBook";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {map, switchMap} from "rxjs/operators";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree} from "../Util/DeltaScanner";
import { flatten, Dictionary } from "lodash";


/**
 * The type inference on this method is not good
 * @param sourced
 */
export function flattenTreeOfObservables<T extends Observable<U>, U>({sourced}: DeltaScan<T>): Observable<U[]> {
    const flattenObservables = sourced ? flattenTree(sourced) : [];
    return combineLatest(flattenObservables)
}

export class ViewingFrameManager {
    framesInView = new DeltaScanner<OpenBook, 'root'>();
    private visibleWordElementMaps: Observable<Dictionary<IAnnotatedCharacter[]>[]>;

    constructor() {
        this.visibleWordElementMaps = this.framesInView
            .mapWith((bookFrame: OpenBook) => bookFrame
                .textData$
                .pipe(map(({wordElementsMap}) => wordElementsMap))
            ).updates$.pipe(
                switchMap((deltaScan: DeltaScan<Observable<Dictionary<IAnnotatedCharacter[]>>>) => {
                    // Necessary, or typescript will have unknown
                        const observables: Observable<Dictionary<IAnnotatedCharacter[]>[]> =  flattenTreeOfObservables(deltaScan);
                        return observables;
                    }
                ),
            );
    }

    getHighlightElementsForWords(
        wordElementMaps: Dictionary<IAnnotatedCharacter[]>[],
        word: string
    ) {
        const results: IAnnotatedCharacter[] = [];
        for (let i = 0; i < wordElementMaps.length; i++) {
            const wordElementMap = wordElementMaps[i];
            if (wordElementMap[word]) {
                results.push(...wordElementMap[word]);
            }
        }
        return results;
    }
}