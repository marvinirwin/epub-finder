import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {last, map, scan, shareReplay, startWith} from "rxjs/operators";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import assert from "assert";
import {sumBy, orderBy} from "lodash";
import moment from "moment";

export class WordCountTableRow {
    wordCountRecords: IWordCountRow[] = [];
    wordRecognitionRecords: IWordRecognitionRow[] = [];

    getCurrentCount(): number {
        return sumBy(this.wordCountRecords, wordCountRow => wordCountRow.count)
    }

    getCurrentDueDate(): Date {
        return this.wordRecognitionRecords[this.wordRecognitionRecords.length - 1]?.nextDueDate || new Date();
    }

    due() {
        return this.wordRecognitionRecords[this.wordRecognitionRecords.length - 1]?.nextDueDate?.getTime() || 0
            > (new Date()).getTime()
    }
    new() {
        return this.wordRecognitionRecords.length === 0;
    }

    learning() {
        // Learning records are those whose advance record is on a different day than the last review
        // The "advance record" is a record which has a change in recognitionScore
        const sortedRecords = orderBy(this.wordRecognitionRecords, 'timestmap', 'desc');
        let previousRecord: IWordRecognitionRow | undefined;
        const advanceRecord = sortedRecords.find(nextRecord => {
            if (!previousRecord) previousRecord = nextRecord;
            else {
                return previousRecord.recognitionScore < nextRecord.recognitionScore
            }
        })
        const lastRecord = this.wordRecognitionRecords[this.wordRecognitionRecords.length - 1];
        if (!advanceRecord && lastRecord) return true;
        if (!lastRecord || !advanceRecord) return false
        return moment(lastRecord.timestamp).isSame(moment(advanceRecord.timestamp), 'day')
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
        let number = (new Date()).getTime() - this.getCurrentDueDate().getTime();
        return number + (number * this.getCurrentCount())
    }

    constructor(public word: string) {
    }
}