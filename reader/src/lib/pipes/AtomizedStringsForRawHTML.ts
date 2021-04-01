import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { AtomizeHtml } from '../Workers/worker.helpers'

export const AtomizedStringsForRawHTML = (
    rawHTML$: Observable<string>,
): Observable<string> => {
    return rawHTML$.pipe(switchMap(AtomizeHtml))
}
