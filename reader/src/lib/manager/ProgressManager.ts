import {combineLatest, Observable} from "rxjs";
import {Dictionary, sum} from 'lodash';
import {map} from "rxjs/operators";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {CORRECT_RECOGNITION_SCORE} from "../highlighting/Highlighter";
import HSK1 from '../hsk/hsk-level-1.json';
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {ScheduleRow} from "../schedule/schedule-row";

export interface HSKWord {
    id: number;
    hanzi: string;
}

export class HSKLevel {
    protected getWordScore(word: string, wordScores: Dictionary<WordRecognitionRow>) {
        const wordScore = wordScores[word];
        if (!wordScore) return 0;
        if (wordScore.grade > 10) return 10;
        return wordScore.grade;
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

export type Fraction = [number, number];

const ProgressTypes = {
    hsk1: Object.values(HSK1).map(({hanzi}) => hanzi),
}

export class ProgressManager {


    constructor({
                    wordRecognitionRows$,
                    scheduleRows$,
                }: {
        wordRecognitionRows$: Observable<ds_Dict<WordRecognitionRow[]>>,
        scheduleRows$: Observable<ds_Dict<ScheduleRow>>
    }) {
        // Let's maintain some fractions
        // Ultimate Progress
        // HSK Progress
        // Document-level progress
        // Each one of these progress' is available by time periods IE monthly/daily/hourly/minutely
    }





}

function dateBetween(timestamp: Date, startTime: Date, endTime: Date): boolean {
    return timestamp.getTime() > startTime.getTime() && timestamp.getTime() < endTime.getTime();
}


export type WeightedWord = [string, number];

export class Progress {
    constructor(
        // Our word recongition rows need to be filtered by HSK membership, or story membership
        public wordRecognitionRows: Observable<ds_Dict<WordRecognitionRow[]>>,
        public weightedWords$: Observable<ds_Dict<WeightedWord>>,
    ) {
    }


    perTimePeriod(startTime: Date, endTime: Date) {
        return combineLatest([
            this.wordRecognitionRows.pipe(
                // This gives me a map of word => [recognition rows in this date range]
                // Now we should combineLatest with the other
                map(wordRecognitionRows =>
                    Object.fromEntries(Object.entries(wordRecognitionRows)
                        .map(([word, rows]) => [
                            word,
                            rows.filter(row => dateBetween(row.timestamp, startTime, endTime))
                        ])
                        .filter(([, rows]) => rows.length)
                    ))
            ),
            this.weightedWords$
        ]).pipe(
            map(([wordRecognitionWords, weightedWords]: [ds_Dict<WordRecognitionRow[]>, ds_Dict<WeightedWord>]) => {
                const missingWords = new Set<string>(Object.keys(weightedWords));
                Object.entries(wordRecognitionWords).forEach(([word, recognitionRows]) => {
                    // If the last one is positive, we're good
                    const correctToday =  recognitionRows[recognitionRows.length - 1].grade >= CORRECT_RECOGNITION_SCORE;
                    if (correctToday) {
                        missingWords.delete(word);
                    }
                });
                return [
                    sum(
                        Object.entries(weightedWords).filter(([word, weight]) => !missingWords.has(word)).map(([word, weight]) => weight)
                    ),
                    sum(Object.values(weightedWords).map(
                        ([word, weight]) => weight
                    ))
                ]
            })
        )
    }
}


