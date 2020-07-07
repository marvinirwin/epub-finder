import {ReplaySubject, Subject} from "rxjs";
import {ITrie} from "./Interfaces/Trie";
import {uniq} from "lodash";

export class TrieWrapper {
    public changeSignal$: Subject<void>;
    getUniqueLengths(): number[] {
        const words = this.t.getWords(false);
        return uniq(words.map(w => w.length));
    }

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