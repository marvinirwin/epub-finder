import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import {WordRecognitionRow} from "./word-recognition-row";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";
import {orderBy, sum} from "lodash";
import moment from "moment";
import {NormalizedValue} from "../manager/normalized-value.interface";
import {SrmService} from "../srm/srm.service";
import humanizeDuration from "humanize-duration";
import {isSameDay} from 'date-fns';
import {last} from "rxjs/operators";

export interface ScheduleRowData {
    wordCountRecords: DocumentWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    pronunciationRecords: PronunciationProgressRow[];
    word: string;
}


export interface NormalizedScheduleRowData extends ScheduleRowData {
    count: SortValue<number>;
    dueDate: SortValue<Date>;
    length: SortValue<number>;
    finalSortValue: number;
    normalizedCount: NormalizedValue,
    normalizedDate: NormalizedValue,
}

export interface SortValue<T> {
    value: T;
    normalValue: number;
    inverseLogNormalValue: number;
    weightedInverseLogNormalValue: number;
    weight: number;
}


export class ScheduleRow<T extends ScheduleRowData = ScheduleRowData> {
    private _dueDate: Date;

    constructor(public d: T) {
        this._dueDate = this.d.wordRecognitionRecords[this.d.wordRecognitionRecords.length - 1]?.nextDueDate || new Date();
    }

    public count() {
        return sum(this.d.wordCountRecords.map(r => r.count));
    }

    public dueDate() {
        return this._dueDate;
    }

    public isNew() {
        return this.d.wordRecognitionRecords.length === 0;
    }

    public wordRecognitionScore() {
        return this.d.wordRecognitionRecords[this.d.wordRecognitionRecords.length - 1]?.grade || 0;
    }

    public isToReview() {
        if (this.isLearningOrReviewing()) return false;
        return this.isOverDue();
    }

    public isOverDue() {
        const myDueDate = this.dueDate();
        return myDueDate < new Date();
    }

    public hasNRecognizedInARow(n = 2) {
        const last2 = this.d.wordRecognitionRecords.slice(n * -1);
        return last2.every(rec => rec.grade === SrmService.correctScore());
    }

    static lastNRecords<T>(r: T[], n: number) {
        return r.slice(n * -1)
    }

    public isLearningOrReviewing() {
        if (!this.d.wordRecognitionRecords.length) return false;
        if (!this.isOverDue()) {
            return false;
        }
        // Learning records are those whose advance record is on a different day than the last review
        // Or they just have review records and no advance record

        // The "advance record" is a record which has a change in recognitionScore
        const mostRecentRecordsFirst = orderBy(this.d.wordRecognitionRecords, 'timestamp', 'desc');
        const mostRecentRecord: WordRecognitionRow = mostRecentRecordsFirst[0];
        const advanceRecord = mostRecentRecordsFirst.find(temporallyPrecedingRecord => {
            return mostRecentRecord.grade > temporallyPrecedingRecord.grade;
        })
        const lastRecord = this.d.wordRecognitionRecords[this.d.wordRecognitionRecords.length - 1];

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
    }

    public dueIn() {
        return humanizeDuration(this.dueDate().getTime() - Date.now(), {largest: 3})
    }

    public isUnrecognized() {
        return this.hasNRecognizedInARow(1);
    }

    public isSomewhatRecognized() {
        return this.hasNRecognizedInARow(2) && this.isOverDue();
    }

    public isRecognized() {
        return !this.isUnrecognized() && !this.isSomewhatRecognized()
    }

    isLearnedToday() {
        const lastTwoRecords = ScheduleRow.lastNRecords(
            this.d.wordRecognitionRecords,
            2
        );
        return lastTwoRecords
            .every(
                r => r.grade >= 3 &&
                isSameDay(r.timestamp, new Date()) &&
                (r.nextDueDate || 0) > new Date()
            );
    }
    isUnlearned() {
        return this.d.wordRecognitionRecords.length === 0;
    }
}