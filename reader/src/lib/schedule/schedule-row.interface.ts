import {DocumentWordCount} from "../Interfaces/DocumentWordCount";
import {WordRecognitionRow} from "./word-recognition-row";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";
import {orderBy, sum} from "lodash";
import moment from "moment";

export interface ScheduleRowData {
    wordCountRecords: DocumentWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    pronunciationRecords: PronunciationProgressRow[];
    word: string;
}


export interface NormalizedScheduleRowData extends ScheduleRowData {
    count: SortValue<number>;
    dueDate: SortValue<Date>;
    finalSortValue: number;
}

export interface SortValue<T> {
    value: T;
    normalValue: number;
    inverseLogNormalValue: number;
    weightedInverseLogNormalValue: number;
    weight: number;
}


