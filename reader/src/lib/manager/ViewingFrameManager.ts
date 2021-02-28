import {combineLatest, Observable} from "rxjs";
import {DeltaScan, flattenTree} from "../delta-scan/delta-scan.module";


/**
 * The type inference on this method is not good
 * @param sourced
 */
export function flattenTreeOfObservables<T extends Observable<U>, U>({sourced}: DeltaScan<T>): Observable<U[]> {
    const flattenObservables = sourced ? flattenTree(sourced) : [];
    return combineLatest(flattenObservables)
}

