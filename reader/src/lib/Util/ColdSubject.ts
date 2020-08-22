import {merge, Observable, Subject} from "rxjs";
import {map, mergeAll, scan, shareReplay, switchMap, tap} from "rxjs/operators";

export class ColdSubject<T> {
    public addObservable$ = new Subject<Observable<T>>();
    public obs$: Observable<T>;
    constructor() {
        this.obs$ = this.addObservable$.pipe(
            map(obs$ => obs$.pipe(shareReplay(1))),
            mergeAll(),
            shareReplay(1)
        );
    }
}