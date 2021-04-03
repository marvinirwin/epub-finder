import { BehaviorSubject, Observable } from 'rxjs'
import { shareReplay, switchMap, tap } from 'rxjs/operators'

export const createLoadingObservable = <T, U>(
    o$: Observable<T>,
    switchMapFn: (v: T) => Promise<U> | Observable<U>,
): {
    obs$: Observable<U>
    isLoading$: Observable<boolean>
} => {
    const isLoading$ = new BehaviorSubject(false)
    return {
        isLoading$,
        obs$: o$.pipe(
            tap(() => isLoading$.next(true)),
            switchMap(switchMapFn),
            tap(() => isLoading$.next(false)),
            shareReplay(1),
        ),
    }
}
