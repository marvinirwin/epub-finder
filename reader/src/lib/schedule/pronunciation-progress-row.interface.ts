export interface PronunciationProgressRow {
    word: string;
    id: number | string;
    success: boolean;
    created_at: Date;
    language_code: string
    creator_id: number | string;
}
