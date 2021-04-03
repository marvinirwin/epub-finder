import { BehaviorSubject, Observable } from 'rxjs'
import { shareReplay, switchMap, tap } from 'rxjs/operators'
import { LoadingObservable } from '../../components/quiz/word-card.interface'
import { useObservableState } from 'observable-hooks'

export const createLoadingObservable = <T, U>(
    o$: Observable<T>,
    switchMapFn: (v: T) => Promise<U> | Observable<U>,
): LoadingObservable<U> => {
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

export const useLoadingObservable = <T>(l$: LoadingObservable<T>) => {
    const value = useObservableState(l$.obs$);
    const isLoading = useObservableState(l$.isLoading$);
    return {value, isLoading}
}

export const useLoadingObservableString = (l$: LoadingObservable<string | undefined>, loadingStr: string) => {
    const {value, isLoading} = useLoadingObservable(l$);
    if (isLoading) {
        return loadingStr;
    }
    return value;
}