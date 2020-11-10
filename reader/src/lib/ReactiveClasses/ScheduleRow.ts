import {BookWordCount} from "../Interfaces/BookWordCount";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";
import {orderBy, sumBy} from "lodash";
import moment from "moment";

export function wordCount(s: ScheduleRow) {
    return sumBy(s.wordCountRecords, wordCountRow => wordCountRow.count)
}

export function wordRecognitionScore(s: ScheduleRow) {
    return s.wordRecognitionRecords[s.wordRecognitionRecords.length - 1]?.recognitionScore || 0;
}

export function dueDate(s: ScheduleRow) {
    return s.wordRecognitionRecords[s.wordRecognitionRecords.length - 1]?.nextDueDate || new Date();
}

export function isNew(s: ScheduleRow) {
    return s.wordRecognitionRecords.length === 0;
}

export function isToReview(s: ScheduleRow) {
    const learning = isLearning(s);
    if (learning) return false;
    const myDueDate = dueDate(s);
    return myDueDate.getTime() < (new Date().getTime());
}

export function isLearning(s: ScheduleRow) {
    if (!s.wordRecognitionRecords.length) return false;
    // Learning records are those whose advance record is on a different day than the last review
    // Or they just have review records and no advance record

    // The "advance record" is a record which has a change in recognitionScore
    const mostRecentRecordsFirst = orderBy(s.wordRecognitionRecords, 'timestamp', 'desc');
    const mostRecentRecord: WordRecognitionRow = mostRecentRecordsFirst[0];
    const advanceRecord = mostRecentRecordsFirst.find(temporallyPrecedingRecord => {
        return mostRecentRecord.recognitionScore > temporallyPrecedingRecord.recognitionScore;
    })
    const lastRecord = s.wordRecognitionRecords[s.wordRecognitionRecords.length - 1];

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

export interface ScheduleRow {
    wordCountRecords: BookWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    word: string;
    sortString?: string;
    sortNumber?: number;
}