export interface IWordRecognitionRow {
    id?: number;
    word: string;
    timestamp: Date;
    recognitionScore: number;
    nextDueDate?: Date;
}