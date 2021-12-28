export interface LeaderBoardDto {
    records: LeaderBoardRecord[];
}
export interface LeaderBoardRecord {
    userLabel: string;
    lastRecognitionRecord: {created_at: Date; word: string};
    recognitionRecordsThisWeek: number;
}
