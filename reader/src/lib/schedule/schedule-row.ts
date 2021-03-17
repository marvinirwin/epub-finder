import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import {WordRecognitionRow} from "./word-recognition-row";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";
import {NormalizedValue} from "../manager/normalized-value.interface";
import {SrmService} from "../srm/srm.service";
import {formatDistance, isAfter, isToday} from 'date-fns';
import {SuperMemoGrade, SuperMemoItem} from "supermemo";


export interface QuizScheduleRowData {
    wordCountRecords: DocumentWordCount[];
    greedyWordCountRecords: DocumentWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    pronunciationRecords: PronunciationProgressRow[];
    word: string;
}

export type ScheduleRowRecord = SuperMemoItem & {
    nextDueDate: Date;
    grade: SuperMemoGrade;
    timestamp: Date;
};

export interface NormalizedQuizCardScheduleRowData extends QuizScheduleRowData {
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
    normalizedValueObject: NormalizedValue;
}

export type ScheduleRowItem = {
    nextDueDate: Date,
    grade: SuperMemoGrade,
    timestamp: Date,
    repetition: number,
    interval: number,
    efactor: number
};

export const recordsLearnedToday = (r1: ScheduleRowItem[]) => {
    const lastTwoRecords = ScheduleRow.lastNRecords(
        r1,
        2
    );
    return lastTwoRecords.length === 2 && lastTwoRecords
        .every(
            r => r.grade >= 3 &&
                isToday(r.timestamp) &&
                isAfter(r.nextDueDate, Date.now())
        );
};
export const recordsLearnedAnyDay = (r1: ScheduleRowItem[]) => {
    const lastTwoRecords = ScheduleRow.lastNRecords(
        r1,
        2
    );
    return lastTwoRecords.length === 2 && lastTwoRecords
        .every(
            r => r.grade >= 3 &&
                isAfter(r.nextDueDate, Date.now())
        );
};


export class ScheduleRow<T> {
    private _dueDate: Date;

    constructor(public d: T, private superMemoRecords: ScheduleRowItem[]) {
        this._dueDate = this.superMemoRecords[this.superMemoRecords.length - 1]?.nextDueDate || new Date();
    }

    public dueDate() {
        return this._dueDate;
    }

    public isNew() {
        return this.superMemoRecords.length === 0;
    }

    public recognitionScore() {
        return this.superMemoRecords[this.superMemoRecords.length - 1]?.grade || 0;
    }

    public isToReview() {
        const hasNeverBeenAttempted = this.superMemoRecords.length <= 0;
        if (hasNeverBeenAttempted) {
            return false;
        }
        const isComplete = this.superMemoRecords
            .filter(r => isToday(r.timestamp) && r.grade >= 3);
        if (isComplete) {
            return false;
        }
        const isCurrentlyReviewing = this.superMemoRecords
            .find(r => isToday(r.timestamp));
        if (isCurrentlyReviewing) {
            return false
        }
        return this.isOverDue();
    }

    public isOverDue() {
        const myDueDate = this.dueDate();
        return myDueDate < new Date();
    }

    public hasNRecognizedInARow(n = 2) {
        const last2 = this.superMemoRecords.slice(n * -1);
        return last2.every(rec => rec.grade === SrmService.correctScore());
    }

    static lastNRecords<T>(r: T[], n: number) {
        return r.slice(n * -1)
    }

    public isLearning() {
        const hasNoRecords = !this.superMemoRecords.length;
        if (hasNoRecords) return false;
        const lastRecord = this.superMemoRecords[this.superMemoRecords.length - 1];
        const startedToday = isToday(lastRecord.timestamp);
        const lastTwoRecords = ScheduleRow.lastNRecords(
            this.superMemoRecords,
            2
        );
        const completed = lastTwoRecords.every(record => record.grade >= 3 && isToday(record.timestamp));
        if (completed) {
            return false;
        }
        if (startedToday) {
            return true;
        }
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
        return this.recognitionScore() >= 3;
/*
        return !this.isUnrecognized() && !this.isSomewhatRecognized()
*/
    }

    wasLearnedToday() {
        return recordsLearnedToday(this.superMemoRecords);
    }

    isNotStarted() {
        return this.superMemoRecords.length === 0;
    }
}