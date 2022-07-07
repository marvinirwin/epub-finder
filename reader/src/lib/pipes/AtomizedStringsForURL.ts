import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import { AtomizeUrl } from '../workers/worker.helpers'
import {AtomizedDocumentFromUrlParams} from "languagetrainer-server/src/shared";

export const AtomizedStringsForURL = (
    rawHTML$: Observable<AtomizedDocumentFromUrlParams>,
): Observable<string> => {
    return rawHTML$.pipe(switchMap(AtomizeUrl))
}
