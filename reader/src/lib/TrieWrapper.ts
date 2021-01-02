import {BehaviorSubject, ReplaySubject, Subject} from "rxjs";
import {ITrie} from "./Interfaces/Trie";

export class TrieWrapper {
    public changeSignal$ = new ReplaySubject<TrieWrapper>(1);
    public newWords$ = new ReplaySubject<string[]>(1);

    private lengths: { [key: number]: number } = {};
    private wordSet = new Set<string>();

    constructor(public t: ITrie) {
        this.changeSignal$.next(this);
    }

    addWords(...words: string[]) {
        const newWords: string[] = [];
        words.forEach(w => {
            if (!this.wordSet.has(w)) {
                newWords.push(w);
                this.wordSet.add(w);
                this.lengths[w.length] = (this.lengths[w.length] || 0) + 1;
            }
            // Can't add empty strings to trie or it will throw "expected string got string" error I think
            if (w.length) {
                this.t.addWord(w);
            }
        })
        if (newWords.length) {
            this.changeSignal$.next(this)
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


        if (words.length) {
            this.changeSignal$.next(this)
        }
    }

    uniqueLengths(): number[] {
        return Object.entries(this.lengths)
            .filter(([key, val]) => val > 0).map(([key]) => parseInt(key))
    }
}