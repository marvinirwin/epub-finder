import {ReplaySubject} from "rxjs";
import {iWordCountRow} from "./Manager";
import {aBook} from "./RenderingBook";
import {Dictionary} from "lodash";
import {isChineseCharacter} from "./serializeable/worker-safe/Card";

export abstract class cBookInstance {
    abstract get localStorageKey(): string;
    book: aBook | undefined;
    wordCountRecords$: ReplaySubject<iWordCountRow[]> = new ReplaySubject<iWordCountRow[]>(1)
    rawText$: ReplaySubject<string> = new ReplaySubject<string>(1)

    constructor(public name: string) {
        this.rawText$.subscribe(text => {
            const countedCharacters: Dictionary<number> = text
                .split('')
                .filter(isChineseCharacter)
                .reduce((acc: Dictionary<number>, letter) => {
                if (!acc[letter]) {
                    acc[letter] = 1;
                } else {
                    acc[letter]++;
                }
                return acc;
            }, {});

            this.wordCountRecords$.next(
                Object.entries(countedCharacters).map(([letter, count]) => ({
                    book: this.name,
                    word: letter,
                    count
                }))
            )
        })
    }

    abstract toSerialized(): any;
}