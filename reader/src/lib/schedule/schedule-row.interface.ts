import {DocumentWordCount} from "../Interfaces/DocumentWordCount";
import {WordRecognitionRow} from "./word-recognition-row";

export interface ScheduleRow {
    wordCountRecords: DocumentWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    word: string;
    sortString?: string;
    sortNumber?: number;
}