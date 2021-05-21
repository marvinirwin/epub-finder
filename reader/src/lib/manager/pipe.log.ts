import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

export const pipeLog = (label: string) => <T>(obs$: Observable<T>): Observable<T> => obs$.pipe(tap(() => console.log(label)))