import moment from "moment";
import {WordRecognitionRow} from "../schedule/word-recognition-row";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const MINUTE_IN_MILLISECONDS = 60 * 1000;

const FLOOR = 0;

export const RecognitionMap = {
    easy: 2,
    medium: 1,
    hard: 0
}

export interface Ret {
    recognitionScore: number;
    nextDueDate: Date
}

export class SrmService {
    constructor(
        public intervals = [
            1 * DAY_IN_MILLISECONDS,
            2 * DAY_IN_MILLISECONDS,
            3 * DAY_IN_MILLISECONDS,
            8 * DAY_IN_MILLISECONDS,
            17 * DAY_IN_MILLISECONDS
        ],
        public scoreToProgressChange = [-3, -1, 1]
    ) {
    }
    private static getProgressScore(rows: WordRecognitionRow[]): number {
        return rows[rows.length - 1]?.recognitionScore || 0;
    }

    private get maxProgress(): number {
        return this.intervals.length;
    }
    private get correctScore() {
        return this.scoreToProgressChange.length - 1;
    }
    getNextRecognitionRecord(
        previousRows: WordRecognitionRow[],
        score: number,
        now: Date
    ): Ret {
        const newScoreIsCorrect = score === this.scoreToProgressChange.length - 1;
        if (score > (this.scoreToProgressChange.length - 1)) {
            throw new Error(`Invalid recognition score ${score}`)
        }
        const previousProgress = SrmService.getProgressScore(previousRows);
        const newProgress = previousProgress + this.scoreToProgressChange[score];
        const FiveMinutes = 1000 * 60 * 4;
        const OneMinute = 1000 * 60 * 1;
        let dueTimestamp = now.getTime() + Math.floor(Math.random() * FiveMinutes) + OneMinute;
        if (newScoreIsCorrect) {
            if (newProgress < this.maxProgress) {
                dueTimestamp = now.getTime() + this.intervals[previousProgress];
            } else {
                dueTimestamp = moment(now).add(1, 'month').toDate().getTime();
            }
        }
        return {
            recognitionScore: newProgress >= 0 ? newProgress : 0,
            nextDueDate: new Date(dueTimestamp),
        }
    }
}