import {IWordRecognitionRow} from "./IWordRecognitionRow";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const MINUTE_IN_MILLISECONDS = 60 * 1000;

const FLOOR = 0;

export const RecognitionMap = {
    easy: 2,
    medium: 1,
    hard: 0
}

export class SRM {
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
    private getProgressScore(rows: IWordRecognitionRow[]): number {
        return rows[rows.length - 1].recognitionScore;
    }

    private get maxProgress(): number {
        return this.intervals.length;
    }
    private get correctScore() {
        return this.scoreToProgressChange.length - 1;
    }
    getNextRecognitionRecord(
        previousRows: IWordRecognitionRow[],
        score: number,
        now: Date
    ): IWordRecognitionRow {
        const lastRow = previousRows[previousRows.length - 1];
        if (!lastRow) {
            throw new Error("Last row is required")
        }
        const newScoreIsCorrect = score === this.scoreToProgressChange.length - 1;
        if (score > (this.scoreToProgressChange.length - 1)) {
            throw new Error(`Invalid recognition score ${score}`)
        }
        const previousProgress = this.getProgressScore(previousRows);
        const newProgress = previousProgress + this.scoreToProgressChange[score];
        let dueTimestamp = now.getTime() + 1;
        if (newScoreIsCorrect && newProgress < this.maxProgress) {
            dueTimestamp = now.getTime() + this.intervals[previousProgress];
        }
        return {
            ...lastRow,
            recognitionScore: newProgress >= 0 ? newProgress : 0, // Set the floor at -2
            nextDueDate: new Date(dueTimestamp),
        }
    }
}