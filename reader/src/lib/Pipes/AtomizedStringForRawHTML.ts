import {Observable} from "rxjs";
import { map,  switchMap} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {DOMParser} from 'xmldom';
import {jestDetected} from "../Util/Util";
import {AtomizeSrcDoc} from "../Workers/WorkerHelpers";

export const AtomizedStringForRawHTML = (rawHTML$: Observable<string>): Observable<string> => {
    if (jestDetected()) {
        return rawHTML$.pipe(
            map(rawHTML => AtomizedDocument.atomizeDocument(rawHTML).toString())
        )
    } else {
        return rawHTML$.pipe(
            switchMap(AtomizeSrcDoc)
        )
    }
}
