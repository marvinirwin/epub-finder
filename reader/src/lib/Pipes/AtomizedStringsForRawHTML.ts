import {Observable} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/ERROR_DOCUMENT";
import {jestDetected} from "../Util/Util";
import {AtomizeHtml} from "../Workers/WorkerHelpers";

export const AtomizedStringsForRawHTML = (rawHTML$: Observable<string>): Observable<string> => {
    return rawHTML$.pipe(
        switchMap(AtomizeHtml),
    )
}
