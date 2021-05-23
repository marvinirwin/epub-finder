import { ScheduleRow} from '../src/lib/schedule/schedule-row'
import { SuperMemoGrade } from 'supermemo'
import { srmStateChangeRecords, SrmStates } from '../src/lib/schedule/srm-state-change-records'

/*
const scheduleRowWithRecognitionRecords = (wordRecognitionRecords: any[]) =>
    new ScheduleRow<ScheduleRowData>({
        recordsWithDueDate: wordRecognitionRecords,
        wordCountRecords: [],
        pronunciationRecords: [],
        word: 'test',
        greedyWordCountRecords: [],
    })
*/

const getRecognitionRow = (
    timestamp: Date,
    grade: SuperMemoGrade,
    nextDueDate: Date,
) => ({
    grade,
    nextDueDate,
    timestamp,
    efactor: 0,
    id: 0,
    interval: 0,
    repetition: 0,
    word: '',
})

/*
const dueYesterdayDidYesterday: WordRecognitionRow = getRecognitionRow(
    subDays(new Date(), 1),
    5,
    subDays(new Date(), 1),
)
const dueYesterdayDidToday: WordRecognitionRow = getRecognitionRow(
    new Date(),
    5,
    subDays(new Date(), 1),
)
const dueTomorrowDidTodayScheduleRow = getRecognitionRow(
    new Date(),
    5,
    addDays(new Date(), 1),
)
*/

describe('ScheduleRow', () => {
    it('Generates state change records correctly', () => {
        const d = new Date()
        const makeRecords = (...scores: [number, number][]) => scores.map(([grade, day]) => {
            const created_at = new Date()
            created_at.setDate(day)
            return ({
                grade,
                created_at,
            })
        })
        const records = makeRecords(
            [5, 1], // learning
            [5, 1],
            [5, 1], // learned
            [5, 2], // reviewed
            [5, 3], // reviewed
            [1, 4], // learning
            [5, 4],
            [1, 4],
            [5, 4],
            [5, 5],
            [5, 5],
            [5, 5], // learned
        )
        const expectedRecordTypes = [
            SrmStates.learning,
            SrmStates.learned,
            SrmStates.reviewed,
            SrmStates.reviewed,
            SrmStates.learning,
            SrmStates.learned,
        ]
        const results = srmStateChangeRecords(records);
        const actual = results.map(r => r.type)
        expect(actual).toEqual(expectedRecordTypes)
    })
})
