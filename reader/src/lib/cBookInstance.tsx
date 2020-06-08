import {ReplaySubject} from "rxjs";
import {iWordCountRow} from "./Manager";
import {aBook} from "./RenderingBook";

export abstract class cBookInstance {
    localStorageKey!: string;
    book: aBook | undefined;
    wordCountRecords$: ReplaySubject<iWordCountRow[]> = new ReplaySubject<iWordCountRow[]>(1)

    constructor(public name: string) {
    }

    abstract getSerializedForm(): { [key: string]: any }

    abstract createFromSerilizedForm(o: string): cBookInstance[]
}