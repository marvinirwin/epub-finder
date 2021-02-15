import {orderBy, sum, sumBy} from "lodash";
import moment from "moment";
import {ScheduleRowData} from "./schedule-row.interface";
import {WordRecognitionRow} from "./word-recognition-row";
import humanizeDuration from "humanize-duration";
import {SrmService} from "../srm/srm.service";



export class ScheduleRow<T extends ScheduleRowData = ScheduleRowData> {
    constructor(public d: T) {
    }

    count() {
        return sum(this.d.wordCountRecords.map(r => r.count));
    }

    dueDate() {
        return this.d.wordRecognitionRecords[this.d.wordRecognitionRecords.length - 1]?.nextDueDate || new Date();
    }

    isNew() {
        return this.d.wordRecognitionRecords.length === 0;
    }

    wordRecognitionScore() {
        return this.d.wordRecognitionRecords[this.d.wordRecognitionRecords.length - 1]?.recognitionScore || 0;
    }

    isToReview() {
        if (this.isLearning()) return false;
        return this.isOverDue();
    }

    public isOverDue() {
        const myDueDate = this.dueDate();
        return myDueDate.getTime() < (new Date().getTime());
    }

    public hasTwoCorrectRecognitionInARow() {
        const last2 =  this.d.wordRecognitionRecords.slice(-2);
        return last2.every(rec => rec.recognitionScore === SrmService.correctScore());
    }

    isLearning() {
        if (!this.d.wordRecognitionRecords.length) return false;
        // Learning records are those whose advance record is on a different day than the last review
        // Or they just have review records and no advance record

        // The "advance record" is a record which has a change in recognitionScore
        const mostRecentRecordsFirst = orderBy(this.d.wordRecognitionRecords, 'timestamp', 'desc');
        const mostRecentRecord: WordRecognitionRow = mostRecentRecordsFirst[0];
        const advanceRecord = mostRecentRecordsFirst.find(temporallyPrecedingRecord => {
            return mostRecentRecord.recognitionScore > temporallyPrecedingRecord.recognitionScore;
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

    dueIn() {
        return humanizeDuration(this.dueDate().getTime() - Date.now())
    }
}

