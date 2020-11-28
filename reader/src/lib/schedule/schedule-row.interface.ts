import {BookWordCount} from "../Interfaces/BookWordCount";
import {WordRecognitionRow} from "./word-recognition-row";

export interface ScheduleRow {
    wordCountRecords: BookWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    word: string;
    sortString?: string;
    sortNumber?: number;
}