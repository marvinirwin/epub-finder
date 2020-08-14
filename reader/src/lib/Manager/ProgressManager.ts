import {Observable} from "rxjs";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";
import { Dictionary } from 'lodash';
import {map} from "rxjs/operators";

export interface HSKWord {
    id: number;
    hanzi: string;
}

export class HSKLevel {
    protected getWordScore(word: string, wordScores: Dictionary<WordRecognitionRow>) {
        let wordScore = wordScores[word];
        if (!wordScore) return 0;
        if (wordScore.recognitionScore > 10) return 10;
        return wordScore.recognitionScore;
    }

    public progress$: Observable<number>;

    private words: Set<string>;

    constructor(
        words: string[],
        private wordScores$: Observable<Dictionary<WordRecognitionRow>>
    ) {
        this.words = new Set<string>(words);
        this.progress$ = this.wordScores$.pipe(map(wordScores => {
            const maxScore = this.words.size * 10;
            // Each word has a max score of 10
            let sum = 0;
            this.words.forEach(word => {
                sum += this.getWordScore(word, wordScores);
            });
            return Math.floor((maxScore / sum) * 100);
        }))
    }

}
export class ProgressManager {
    hsk1!: HSKLevel;
    constructor() {
    }
}