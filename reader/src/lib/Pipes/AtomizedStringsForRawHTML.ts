import {Observable} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/atomized-document";
import {jestDetected} from "../Util/Util";
import {AtomizeHtml} from "../Workers/worker.helpers";

export const AtomizedStringsForRawHTML = (rawHTML$: Observable<string>): Observable<string> => {
    return rawHTML$.pipe(
        switchMap(AtomizeHtml),
    )
}
