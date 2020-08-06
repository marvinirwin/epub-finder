import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {last, map, scan, shareReplay, startWith} from "rxjs/operators";
import {IWordCountRow} from "../Interfaces/IWordCountRow";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import assert from "assert";
import {sumBy, orderBy} from "lodash";
import moment from "moment";

export class ScheduleRow {
    wordCountRecords: IWordCountRow[] = [];
    wordRecognitionRecords: IWordRecognitionRow[] = [];


    addWordRecognitionRecords(...records: IWordRecognitionRow[]) {
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
        let b = this.getCurrentDueDate().getTime() < (new Date().getTime());
        return b;
    }

    new() {
        return this.wordRecognitionRecords.length === 0;
    }

    learning() {
        // Learning records are those whose advance record is on a different day than the last review
        // Or they just have review records and no advance record

        // The "advance record" is a record which has a change in recognitionScore
        const mostRecentRecordsFirst = orderBy(this.wordRecognitionRecords, 'timestamp', 'desc');
        let previousRecord: IWordRecognitionRow | undefined;
        const advanceRecord = mostRecentRecordsFirst.find(nextRecord => {
            if (this.word === '上') {
                debugger;console.log();
            }
            if (!previousRecord) {
                previousRecord = nextRecord;
            } else {
                return previousRecord.recognitionScore < nextRecord.recognitionScore
            }
        })
        if (this.word === '上') {
            debugger;console.log();
        }
        const lastRecord = this.wordRecognitionRecords[this.wordRecognitionRecords.length - 1];
        let newVar = !advanceRecord && lastRecord;
        // No last record and no
        let b = !lastRecord || !advanceRecord;
        let b1 = lastRecord === advanceRecord;
        if (newVar) return true;
        if (b) return false;
        if (b1) return false;
        // @ts-ignore
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
        let number = (new Date()).getTime() - this.getCurrentDueDate().getTime();
        return number + (number * this.getCurrentCount())
    }

    constructor(public word: string) {
    }
}