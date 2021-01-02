import {merge, Observable} from "rxjs";
import {AtomizedDocument} from "../Atomized/atomized-document";
import {AtomizedStringsForRawHTML} from "../Pipes/AtomizedStringsForRawHTML";
import {map, shareReplay} from "rxjs/operators";
import {AtomizedStringsForURL} from "../Pipes/AtomizedStringsForURL";

export type AtomizedDocumentSources = {
    atomizedDocument$?: Observable<AtomizedDocument>,
    url$?: Observable<string>,
    unAtomizedDocument$?: Observable<string>
};

export class DocumentSourcesService {
    public static document({atomizedDocument$, url$, unAtomizedDocument$}: AtomizedDocumentSources): Observable<AtomizedDocument> {
        const sources: Observable<AtomizedDocument>[] = [];
        if (unAtomizedDocument$) {
            sources.push(unAtomizedDocument$.pipe(
                AtomizedStringsForRawHTML,
                map(AtomizedDocument.fromAtomizedString)
            ));
        }
        if (url$) {
            sources.push(url$.pipe(
                AtomizedStringsForURL,
                map(AtomizedDocument.fromAtomizedString)
            ))
        }
        if (atomizedDocument$) {
            sources.push(atomizedDocument$)
        }

        return  merge(...sources).pipe(shareReplay(1));
    }
}