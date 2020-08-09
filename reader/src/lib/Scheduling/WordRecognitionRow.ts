export interface WordRecognitionRow {
    id?: number;
    word: string;
    timestamp: Date;
    recognitionScore: number;
    nextDueDate?: Date;
}