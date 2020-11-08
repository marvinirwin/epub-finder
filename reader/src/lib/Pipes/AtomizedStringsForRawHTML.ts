import {Observable} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {jestDetected} from "../Util/Util";
import {AtomizeSrcDoc} from "../Workers/WorkerHelpers";

export const AtomizedStringsForRawHTML = (rawHTML$: Observable<string>): Observable<string[]> => {
    if (jestDetected()) {
        return rawHTML$.pipe(
            map(rawHTML => {
                let atomizedDocument = AtomizedDocument.atomizeDocument(rawHTML);
                return [
                    atomizedDocument.toString(),
                    ...atomizedDocument.getChunkedDocuments().map(doc => doc.toString())
                ];
            })
        )
    } else {
        return rawHTML$.pipe(
            switchMap(AtomizeSrcDoc),
        )
    }
}
