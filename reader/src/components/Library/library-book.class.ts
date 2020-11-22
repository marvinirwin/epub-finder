import {Observable, ReplaySubject} from "rxjs";

export class LibraryBook {
    name$ = new ReplaySubject<string>(1);
    bookId$ = new ReplaySubject<number>(1)
    error$ = new ReplaySubject<string>(1);
    constructor() {
    }
}