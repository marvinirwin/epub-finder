import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import debug from 'debug';

export const pipeLog = (label: string) =>
    <T>(obs$: Observable<T>): Observable<T> =>
        obs$.pipe(tap(() => debug(label)('')))