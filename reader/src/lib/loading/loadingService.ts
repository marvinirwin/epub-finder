import {BehaviorSubject, combineLatest, merge, Observable, pipe, ReplaySubject} from "rxjs";
import {map, tap} from "rxjs/operators";
import {LoadingSignal} from "./loadingSignal";

export class LoadingService {
    isLoading$: Observable<boolean>
    latestLoadingMessage$: Observable<string>
    loadingMessage$ = new BehaviorSubject<{id: number, message: string}[]>([]);

    constructor(
        {
            loadingSignals
        }: {
            loadingSignals: LoadingSignal[]
        }
    ) {
        this.isLoading$ = combineLatest([
            loadingSignals.map(loadingSignal => loadingSignal.isLoading$)]).pipe(
            map(isLoadings => isLoadings.some(isLoading => isLoading))
        );
        this.latestLoadingMessage$ = merge(...loadingSignals.map(loadingSignal => loadingSignal.latestMessage$))
    }

    wrapWithLoader<InputType, OutputType>(
        o$: Observable<InputType>,
        f: ((o$: Observable<InputType>) => Observable<OutputType>),
        label: ((i: InputType) => string) | string
    ): Observable<OutputType> {
        let id: undefined | number;
        return o$.pipe(
            tap((i: InputType) => {
                const message = typeof label === 'function' ? label(i) : label;
                id = Math.random();
                this.loadingMessage$.next(this.loadingMessage$.getValue().concat({message, id}));
            }),
            f,
            tap((v: OutputType) => {
                this.loadingMessage$.next(this.loadingMessage$.getValue().filter(loadingMessage => loadingMessage.id !== id));
            })
        )
    }
}

export class LoadingWrapperService {
    loadingMessage$ = new BehaviorSubject<{id: number, message: string}[]>([]);

    wrapWithLoader<InputType, OutputType>(
        o$: Observable<InputType>,
        f: ((o$: Observable<InputType>) => Observable<OutputType>),
        label: ((i: InputType) => string) | string
    ): Observable<OutputType> {
        let id: undefined | number;
        return o$.pipe(
            tap((i: InputType) => {
                const message = typeof label === 'function' ? label(i) : label;
                id = Math.random();
                this.loadingMessage$.next(this.loadingMessage$.getValue().concat({message, id}));
            }),
            f,
            tap((v: OutputType) => {
                this.loadingMessage$.next(this.loadingMessage$.getValue().filter(loadingMessage => loadingMessage.id !== id));
            })
        )
    }
}
