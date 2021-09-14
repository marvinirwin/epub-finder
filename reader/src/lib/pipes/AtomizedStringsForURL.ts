import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import { AtomizeUrl } from '../Workers/worker.helpers'
import {AtomizedDocumentFromUrlParams} from "@shared/*";

export const AtomizedStringsForURL = (
    rawHTML$: Observable<AtomizedDocumentFromUrlParams>,
): Observable<string> => {
    return rawHTML$.pipe(switchMap(AtomizeUrl))
}
