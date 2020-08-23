import {BehaviorSubject, merge, Observable, Subject} from "rxjs";
import {map, mergeAll, scan, shareReplay, switchMap, tap} from "rxjs/operators";

export class ColdSubject<T> {
    public addObservable$ = new Subject<Observable<T>>();
    public obs$: Observable<T>;
    public acc$ = new BehaviorSubject<Observable<T>>(merge());
    constructor() {
/*
        this.obs$ = this.addObservable$.pipe(
            map(obs$ => obs$.pipe(shareReplay(1))),
            mergeAll(),
            shareReplay(1)
        );
*/
        this.addObservable$.subscribe(obs => {
            this.acc$.next(merge(this.acc$.getValue(), obs))
        })
        this.obs$ = this.acc$.pipe(
            switchMap(v => v)
        )

        // This is a hack, because if nobody is listening then nobody will save the values emitted
        // Though this kind of defeats the concept of a
        this.obs$.subscribe(() => {})
    }
}