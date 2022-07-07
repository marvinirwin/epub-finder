import { merge, Observable } from 'rxjs'
import { AtomizedDocument } from "languagetrainer-server/src/shared"
import { AtomizedStringsForRawHTML } from '../pipes/AtomizedStringsForRawHTML'
import { map, shareReplay } from 'rxjs/operators'
import { AtomizedStringsForURL } from '../pipes/AtomizedStringsForURL'

export type AtomizedDocumentSources = {
    atomizedDocument$?: Observable<AtomizedDocument>
    url$?: Observable<string>
    unAtomizedDocument$?: Observable<string>
    documentId: string
}

export class DocumentSourcesService {
    public static document({
        atomizedDocument$,
        url$,
        unAtomizedDocument$,
        documentId
    }: AtomizedDocumentSources): Observable<AtomizedDocument> {
        const sources: Observable<AtomizedDocument>[] = []
        if (unAtomizedDocument$) {
            sources.push(
                unAtomizedDocument$.pipe(
                    map(documentSrc => {
                        return {
                            documentId,
                            documentSrc
                        }
                    }),
                    AtomizedStringsForRawHTML,
                    map(AtomizedDocument.fromAtomizedString),
                    shareReplay(1)
                ),
            )
        }
        if (url$) {
            sources.push(
                url$.pipe(
                    map(url => {
                        return {
                            documentId,
                            url,
                        }
                    }),
                    AtomizedStringsForURL,
                    map(AtomizedDocument.fromAtomizedString),
                    shareReplay(1)
                ),
            )
        }
        if (atomizedDocument$) {
            sources.push(atomizedDocument$)
        }

        return merge(...sources).pipe(shareReplay(1))
    }
}
