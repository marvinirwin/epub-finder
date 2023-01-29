import {combineLatest, merge, Observable} from "rxjs";
import { map } from "rxjs/operators";
import {LoadingSignal} from "./loadingSignal";

export class LoadingService  {
    isLoading$: Observable<boolean>
    latestLoadingMessage$: Observable<string>
    constructor(
        {
            loadingSignals
        }: {
            loadingSignals: LoadingSignal[]
        }
    ) {
        this.isLoading$ = combineLatest([loadingSignals.map(loadingSignal => loadingSignal.isLoading$)]).pipe(
            map(isLoadings => isLoadings.some(isLoading => isLoading))
        );
        this.latestLoadingMessage$ = merge(...loadingSignals.map(loadingSignal => loadingSignal.latestMessage$))
    }
}