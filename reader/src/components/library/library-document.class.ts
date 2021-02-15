import {Observable, ReplaySubject} from "rxjs";

export class LibraryDocument {
    name$ = new ReplaySubject<string>(1);
    documentId$ = new ReplaySubject<number>(1)
    error$ = new ReplaySubject<string>(1);
    constructor() {
    }
}