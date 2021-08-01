export interface LeaderBoardDto {
    records: LeaderBoardRecord[];
}
export interface LeaderBoardRecord {
    userLabel: string;
    lastLearned: {created_at: Date; word: string};
    learnedThisWeek: number
}
