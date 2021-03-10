import moment from "moment";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {supermemo, SuperMemoGrade, SuperMemoItem} from 'supermemo';


const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const MINUTE_IN_MILLISECONDS = 60 * 1000;

const FLOOR = 0;

export const RecognitionMap: {[key: string]: SuperMemoGrade} = {
    easy: 5,
    medium: 2,
    hard: 0
}

export class SrmService {
    constructor() { }

    private static getProgressScore(rows: WordRecognitionRow[]): number {
        return rows[rows.length - 1]?.repetition || 0;
    }

    public static correctScore() {
        return 3
    }

    getNextRecognitionRecord(
        previousRows: WordRecognitionRow[],
        score: SuperMemoGrade,
    ): SuperMemoItem {
        const mostRecentRow: SuperMemoItem = previousRows[previousRows.length - 1] || {
            interval: 0,
            repetition: 0,
            efactor: 2.5,
        };
        return supermemo(mostRecentRow, score);
    }
}