import {ReplaySubject, Subject} from "rxjs";
import {ITrie} from "./Interfaces/Trie";

export class TrieWrapper {
    public changeSignal$: Subject<void>;

    constructor(public t: ITrie) {
        this.changeSignal$ = new ReplaySubject<void>(1);
        this.changeSignal$.next();
    }

    addWords(...words: string[]) {
        words.forEach(w => this.t.addWord(w))
        if (words.length) this.changeSignal$.next()

    }

    removeWords(...words: string[]) {
        words.forEach(w => this.t.removeWord(w))
        if (words.length) this.changeSignal$.next()
    }
}