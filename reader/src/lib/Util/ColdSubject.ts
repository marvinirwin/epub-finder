import {merge, Observable, Subject} from "rxjs";
import {mergeAll, scan, switchMap} from "rxjs/operators";

export class ColdSubject<T> {
    public addObservable$ = new Subject<Observable<T>>();
    public obs$: Observable<T>;
    constructor() {
        this.obs$ = this.addObservable$.pipe(
            mergeAll()
        )
    }
}