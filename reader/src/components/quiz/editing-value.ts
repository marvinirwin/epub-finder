import {Observable, ReplaySubject} from "rxjs";

export class EditableValue<T> {
    setValue$ = new ReplaySubject<T>(1)

    constructor(
        public value$: Observable<T>,
        cb: (valueChanged$: Observable<T>) => void,
    ) {
        cb(this.setValue$)
    }

    public set(v: T) {
        this.setValue$.next(v)
    }
}