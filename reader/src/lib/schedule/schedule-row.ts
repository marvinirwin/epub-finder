import {DocumentWordCount} from "../../../../server/src/shared/DocumentWordCount";
import {WordRecognitionRow} from "./word-recognition-row";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";
import {sum} from "lodash";
import {NormalizedValue} from "../manager/normalized-value.interface";
import {SrmService} from "../srm/srm.service";
import {isSameDay} from 'date-fns';
import { formatDistance, subDays } from 'date-fns'
import {SuperMemoGrade, SuperMemoItem} from "supermemo";
import {WordCountRecord} from "../../../../server/src/shared/tabulation/tabulate";


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
export interface NormalizedQuizCardScheduleRowData extends QuizScheduleRowData{
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

type ScheduleRowItem = { nextDueDate: Date, grade: SuperMemoGrade, timestamp: Date };

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
        if (this.isLearning()) return false;
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
        if (!this.superMemoRecords.length) return false;
        if (!this.isOverDue()) {
            return false;
        }
        const lastRecord = this.superMemoRecords[this.superMemoRecords.length - 1];
        const last2Records = ScheduleRow.lastNRecords(this.superMemoRecords, 2);
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

    wasLearnedToday() {
        const lastTwoRecords = ScheduleRow.lastNRecords(
            this.superMemoRecords,
            2
        );
        return lastTwoRecords.length === 2 && lastTwoRecords
            .every(
                r => r.grade >= 3 &&
                isSameDay(r.timestamp, new Date()) &&
                (r.nextDueDate || 0) > new Date()
            );
    }

    isUnlearned() {
        return this.superMemoRecords.length === 0;
    }
}