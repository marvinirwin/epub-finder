import {BehaviorSubject, ReplaySubject, Subject} from "rxjs";
import {ITrie} from "./Interfaces/Trie";

export class TrieWrapper {
    public changeSignal$: Subject<void>;
    public newWords$ = new ReplaySubject<string[]>(1);

    private lengths: {[key: number]: number} = {};
    private wordSet = new Set<string>();

    constructor(public t: ITrie) {
        this.changeSignal$ = new ReplaySubject<void>(1);
        this.changeSignal$.next();
    }

    addWords(...words: string[]) {
        const newWords: string[] = [];
        words.forEach(w => {
            if (!this.wordSet.has(w)) {
                newWords.push(w);
                this.wordSet.add(w);
                this.lengths[w.length] = (this.lengths[w.length] || 0) + 1;
            }
            this.t.addWord(w);
        })
        if (words.length) {
            this.changeSignal$.next()
            this.newWords$.next(newWords);
        }
    }

    removeWords(...words: string[]) {
        words.forEach(w => {
            if (this.wordSet.has(w)) {
                this.lengths[w.length]--;
                this.wordSet.delete(w);
            }
            this.t.removeWord(w);
        })

        if (words.length) this.changeSignal$.next()
    }

    getUniqueLengths(): number[] {
        return Object.entries(this.lengths)
            .filter(([key, val]) => val > 0).map(([key]) => parseInt(key))
    }
}