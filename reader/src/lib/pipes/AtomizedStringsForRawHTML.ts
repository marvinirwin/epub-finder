import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { AtomizeHtml } from '../Workers/worker.helpers'
import {AtomizeSrcDocParams} from "@shared/*";

export const AtomizedStringsForRawHTML = (
    rawHTML$: Observable<AtomizeSrcDocParams>,
): Observable<string> => {
    return rawHTML$.pipe(switchMap(AtomizeHtml))
}
