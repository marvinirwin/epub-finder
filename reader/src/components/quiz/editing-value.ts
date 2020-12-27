import {Observable, ReplaySubject} from "rxjs";

export class EditableValue<T> {
    setValue$ = new ReplaySubject<T>(1)
    constructor(
        public value$: Observable<T>,
        onChange: (valueChanged: T) => void
    ) {
        this.setValue$.subscribe(onChange);
    }
    public set(v: T) {
        this.setValue$.next(v)
    }
}