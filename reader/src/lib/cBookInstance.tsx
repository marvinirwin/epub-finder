import {ReplaySubject} from "rxjs";
import {iWordCountRow} from "./Manager";
import {aBook} from "./RenderingBook";

export abstract class cBookInstance {
    abstract get localStorageKey(): string;
    book: aBook | undefined;
    wordCountRecords$: ReplaySubject<iWordCountRow[]> = new ReplaySubject<iWordCountRow[]>(1)

    constructor(public name: string) {
    }

    abstract toSerialized(): any;
}