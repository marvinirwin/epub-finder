import {ScheduleRow, SpacedSortQuizData} from "../schedule/schedule-row";
import {SpacedScheduleRow} from "./space-schedule-row.type";

export type LimitedScheduleRows = {
    scheduleRowsLeftForToday: SpacedScheduleRow[]
    wordsToReview: SpacedScheduleRow[];
    limitedScheduleRows: SpacedScheduleRow[];
    wordsLearnedToday: SpacedScheduleRow[];
    wordsReviewedToday: SpacedScheduleRow[];
    wordsLearning: SpacedScheduleRow[];
    wordsLeftForToday: SpacedScheduleRow[];
    unStartedWords: SpacedScheduleRow[];
    debug: {
        limitedScheduleRows: {
            overDueRows: ScheduleRow<SpacedSortQuizData>[]
            scheduleRowsLeftForToday: ScheduleRow<SpacedSortQuizData>[]
            notOverDueRows: ScheduleRow<SpacedSortQuizData>[]
        }
    },
}