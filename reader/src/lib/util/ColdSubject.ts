import {BehaviorSubject, merge, Observable, Subject} from "rxjs";
import {map, mergeAll, scan, shareReplay, switchMap, tap} from "rxjs/operators";

/**
 * This doesn't work with withLatestFrom, it's complicated
 * I should just use ReplaySubjects and manage my dependencies well
 * @deprecated
 */
export class ColdSubject<T> {
    public addObservable$ = new Subject<Observable<T>>();
    public obs$: Observable<T>;
    constructor() {
        this.obs$ = this.addObservable$.pipe(
            mergeAll(),
            shareReplay(1)
        );
        this.obs$.subscribe()
    }
}