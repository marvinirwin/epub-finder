import {Observable, of} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import {jestDetected} from "../Util/Util";
import {AtomizeUrl} from "../Workers/WorkerHelpers";
import {UnitTestGetPageSrcText} from "../../test/Util/Run";

export const AtomizedStringForURL = (rawHTML$: Observable<string>): Observable<string> => {
    return rawHTML$.pipe(
        switchMap(AtomizeUrl),
    )
    /*
        if (jestDetected()) {
            return rawHTML$.pipe(
                switchMap((url: string) => of(
                    UnitTestGetPageSrcText(url)
                )),
                map(rawHTML => AtomizedDocument.atomizeDocument(rawHTML).toString())
            )
        } else {
            return rawHTML$.pipe(
                switchMap(AtomizeUrl),
            )
        }
    */
}
