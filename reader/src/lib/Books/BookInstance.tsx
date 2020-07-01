import {ReplaySubject} from "rxjs";
import {Dictionary} from "lodash";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";
import {IBook} from "../Interfaces/Book/IBook";
import {IWordCountRow} from "../Interfaces/IWordCountRow";

export abstract class BookInstance {
    abstract get localStorageKey(): string;
    book: IBook | undefined;
    wordCountRecords$: ReplaySubject<IWordCountRow[]> = new ReplaySubject<IWordCountRow[]>(1)
    rawText$: Observable<string>;

    constructor(public name: string) {
    }

    abstract toSerialized(): any;
}