import {combineLatest, Observable} from "rxjs";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {DeltaScan, DeltaScanner, ds_Dict, flattenTree} from "../Tree/DeltaScanner";
import {flatten, Dictionary} from "lodash";
import {OpenDocument} from "../DocumentFrame/open-document.entity";


/**
 * The type inference on this method is not good
 * @param sourced
 */
export function flattenTreeOfObservables<T extends Observable<U>, U>({sourced}: DeltaScan<T>): Observable<U[]> {
    const flattenObservables = sourced ? flattenTree(sourced) : [];
    return combineLatest(flattenObservables)
}

export class ViewingFrameManager {
    framesInView = new DeltaScanner<OpenDocument, 'root'>();

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