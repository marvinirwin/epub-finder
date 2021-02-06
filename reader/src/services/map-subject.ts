import {Observable, Subject} from "rxjs";
import {map, shareReplay} from "rxjs/operators";

export class MapSubject<MapSubjectType, SourceSubjectType> {
    public obs$: Observable<MapSubjectType>;
    public static StringifyMapSubject<T>(s$: Subject<string>) {
        return new MapSubject<T, string>(
            s$,
            v => JSON.stringify(v),
            v => JSON.parse(v)
        )
    }
    constructor(private subject$: Subject<SourceSubjectType>, private inFunc: (v: MapSubjectType) => SourceSubjectType, private outFunc: (v: SourceSubjectType) => MapSubjectType ) {
        this.obs$ = this.subject$.pipe(map(this.outFunc), shareReplay(1))
    }
    next(v: MapSubjectType) {
        this.subject$.next(this.inFunc(v));
    }
}