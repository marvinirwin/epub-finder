import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";
import {orderBy, sumBy, sum} from "lodash";
import moment from "moment";

export class ScheduleRow {
    wordCountRecords: IWordCountRow[] = [];
    wordRecognitionRecords: WordRecognitionRow[] = [];


    addWordRecognitionRecords(...records: WordRecognitionRow[]) {
        this.wordRecognitionRecords.push(...records);
        this.wordRecognitionRecords = orderBy(this.wordRecognitionRecords, 'timestamp')
    }

    getCurrentCount(): number {
        return sumBy(this.wordCountRecords, wordCountRow => wordCountRow.count)
    }

    getCurrentDueDate(): Date {
        return this.wordRecognitionRecords[this.wordRecognitionRecords.length - 1]?.nextDueDate || new Date();
    }

    toReview() {
        // To review are those cards which are past due date, but not learning
        let learning = this.learning();
        if (learning) return false;
        const myDueDate = this.getCurrentDueDate();
        return myDueDate.getTime() < (new Date().getTime());
    }

    new() {
        return this.wordRecognitionRecords.length === 0;
    }

    learning() {
        if (!this.wordRecognitionRecords.length) return false;
        // Learning records are those whose advance record is on a different day than the last review
        // Or they just have review records and no advance record

        // The "advance record" is a record which has a change in recognitionScore
        const mostRecentRecordsFirst = orderBy(this.wordRecognitionRecords, 'timestamp', 'desc');
        let mostRecentRecord: WordRecognitionRow = mostRecentRecordsFirst[0];
        const advanceRecord = mostRecentRecordsFirst.find(temporallyPrecedingRecord => {
/*
            if (this.word === 'undefined') {
                debugger;console.log();
            }
*/
            return mostRecentRecord.recognitionScore > temporallyPrecedingRecord.recognitionScore;
        })
/*
        if (this.word === 'undefined') {
            debugger;console.log();
        }
*/
        const lastRecord = this.wordRecognitionRecords[this.wordRecognitionRecords.length - 1];

        /**
         * If there are no records then we're for sure not learning
         */
        if (!lastRecord) {
            return false;
        }

        /**
         * If there is a last record, but no advance record we're still learning
         */
        if (!advanceRecord) {
            return true;
        }

        // If the advance record is the last record then we just advanced so we're not learning anymore
        if (lastRecord === advanceRecord) {
            return false;
        }
        return !moment(lastRecord.timestamp).isSame(moment(advanceRecord.timestamp), 'day')
/*
        const dayStart = moment().startOf('day').unix();
        const dayEnd = moment().endOf('day').unix();
        // Get the recognition records from today
        const filtered = this.wordRecognitionRecords.filter(wordRecognitionRecord =>
            wordRecognitionRecord.timestamp.getTime() < dayEnd &&
            wordRecognitionRecord.timestamp.getTime() > dayStart
        );
        const sorted = orderBy(filtered, 'timestamp');
        // The first one has to be less than the last
        return sorted[0].recognitionScore < sorted[sorted.length - 1].recognitionScore;
*/
    }

    get orderValue() {
        return sum(this.wordCountRecords.map(c => c.count));
    }

    constructor(public word: string) {
    }
}