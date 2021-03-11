import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import {WordRecognitionRow} from "./word-recognition-row";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";
import {orderBy, sum} from "lodash";
import {NormalizedValue} from "../manager/normalized-value.interface";
import {SrmService} from "../srm/srm.service";
import humanizeDuration from "humanize-duration";
import {isSameDay} from 'date-fns';
import { format, formatDistance, formatRelative, subDays } from 'date-fns'


export interface ScheduleRowData {
    wordCountRecords: DocumentWordCount[];
    greedyWordCountRecords: DocumentWordCount[];
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
        const lastRecord = this.d.wordRecognitionRecords[this.d.wordRecognitionRecords.length - 1];
        const last2Records = ScheduleRow.lastNRecords(this.d.wordRecognitionRecords, 2);
        return last2Records.length === 2 &&
            last2Records
                .every(record =>
                    isSameDay(lastRecord.nextDueDate || new Date(),
                        record.nextDueDate || new Date()
                    ) && record.grade >= 3)
    }

    public dueIn() {
        return formatDistance(this.dueDate(), Date.now(), {addSuffix: true})
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