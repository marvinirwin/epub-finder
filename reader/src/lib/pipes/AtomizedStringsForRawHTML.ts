import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { AtomizeHtml } from '../workers/worker.helpers'
import {AtomizeSrcDocParams} from "languagetrainer-server/src/shared";

export const AtomizedStringsForRawHTML = (
    rawHTML$: Observable<AtomizeSrcDocParams>,
): Observable<string> => {
    return rawHTML$.pipe(switchMap(AtomizeHtml))
}
