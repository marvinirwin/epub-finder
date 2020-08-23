import {BehaviorSubject, merge, Observable, Subject} from "rxjs";
import {map, mergeAll, scan, shareReplay, switchMap, tap} from "rxjs/operators";

export class ColdSubject<T> {
    public addObservable$ = new Subject<Observable<T>>();
    public obs$: Observable<T>;
    public acc$ = new BehaviorSubject<Observable<T>>(merge());
    constructor() {
        this.addObservable$.subscribe(obs => {
            this.acc$.next(merge(this.acc$.getValue(), obs))
        })
        this.obs$ = this.acc$.pipe(
            switchMap(v => v)
        )
    }
}