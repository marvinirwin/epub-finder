import {merge, Observable, Subject} from "rxjs";
import {scan, switchMap} from "rxjs/operators";

export class ColdObservable<T> {
    addObservable$ = new Subject<Observable<T>[]>();
    values$: Observable<T>;
    constructor() {
        this.values$ = this.addObservable$.pipe(
            scan((acc: Observable<T>[], newObservables) => {
                acc.push(...newObservables);
                return acc;
            }, []),
            switchMap(observables => merge(...observables))
        )
    }
}