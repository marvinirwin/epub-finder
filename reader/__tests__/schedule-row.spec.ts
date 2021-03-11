import {ScheduleRow, ScheduleRowData} from "../src/lib/schedule/schedule-row";
import {WordRecognitionRow} from "../src/lib/schedule/word-recognition-row";
import {SuperMemoGrade} from "supermemo";
import {addDays, subDays} from 'date-fns';

const scheduleRowWithRecognitionRecords = (wordRecognitionRecords: any[]) => new ScheduleRow<ScheduleRowData>({
    wordRecognitionRecords,
    wordCountRecords: [],
    pronunciationRecords: [],
    word: 'test',
    greedyWordCountRecords: []
});


const getRecognitionRow = (timestamp: Date, grade: SuperMemoGrade, nextDueDate: Date) => ({
    grade,
    nextDueDate,
    timestamp,
    efactor: 0,
    id: 0,
    interval: 0,
    repetition: 0,
    word: "",
});

const dueYesterdayDidYesterday: WordRecognitionRow = getRecognitionRow(
    subDays(new Date(), 1),
    5,
    subDays(new Date(), 1),
)
const dueYesterdayDidToday: WordRecognitionRow = getRecognitionRow(
    new Date(),
    5,
    subDays(new Date(), 1),
);
const dueTomorrowDidTodayScheduleRow = getRecognitionRow(
    new Date(),
    5,
    addDays(new Date(), 1)
)

describe('ScheduleRow', () => {
        it('Assigns records to learning, reviewing and learned', () => {
            const emptyScheduleRow = scheduleRowWithRecognitionRecords([]);
            expect(!emptyScheduleRow.isToReview() && !emptyScheduleRow.isLearningOrReviewing()).toBe(true);
            const dueYesterdayDidYesterdayRow = scheduleRowWithRecognitionRecords([dueYesterdayDidYesterday]);
            expect(!dueYesterdayDidYesterdayRow.isLearningOrReviewing() && !dueYesterdayDidYesterdayRow.isToReview());
            const dueYesterdayDidTodayScheduleRow = scheduleRowWithRecognitionRecords([dueYesterdayDidToday]);
            expect(dueYesterdayDidTodayScheduleRow.isLearningOrReviewing() && !dueYesterdayDidTodayScheduleRow.isToReview()).toBe(true);
            const dueTomorrowDidTodayRow = scheduleRowWithRecognitionRecords([dueTomorrowDidTodayScheduleRow]);
            expect(!dueTomorrowDidTodayRow.isLearningOrReviewing() && !dueTomorrowDidTodayRow.isToReview()).toBe(true);
        })
    }
)