import {BookWordCount} from "../Interfaces/BookWordCount";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";

export interface ScheduleRow {
    wordCountRecords: BookWordCount[];
    wordRecognitionRecords: WordRecognitionRow[];
    word: string;
    sortString?: string;
    sortNumber?: number;
}