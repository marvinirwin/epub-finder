import {DocumentWordCount} from "../Interfaces/DocumentWordCount";
import {WordRecognitionRow} from "./word-recognition-row";
import {PronunciationProgressRow} from "./pronunciation-progress-row.interface";

export interface ScheduleRow {
    wordCountRecords: DocumentWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    pronunciationRecords: PronunciationProgressRow[];
    word: string;
    sortString?: string;
    sortNumber?: number;
}