import {combineLatest, Observable} from "rxjs";
import {OpenBook} from "../BookFrame/OpenBook";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {map, switchMap} from "rxjs/operators";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree} from "../Tree/DeltaScanner";
import {flatten, Dictionary} from "lodash";


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

    constructor() {

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