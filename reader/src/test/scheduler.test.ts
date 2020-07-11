import {RecognitionMap, SRM} from "../lib/Scheduling/Scheduler";
import {IWordRecognitionRow} from "../lib/Scheduling/IWordRecognitionRow";
import moment from 'moment';

const sm = new SRM();


function expectAndPush(
    rows: IWordRecognitionRow[],
    difficulty: number,
    expectedDay: Date | moment.Moment,
    expectedScore: number
) {
    const row = sm.getNextRecognitionRecord(rows, difficulty, new Date());
    expect(moment(row.nextDueDate).isSame(expectedDay, 'day'));
    expect(row.recognitionScore).toBe(expectedScore);
    rows.push(row);
}

it("Schedules things correctly", async () => {
    let now = new Date();
    let tomorrow = moment(now).add(1, 'day');
    let twoDaysNext = moment(now).add(2, 'day');

    const r1: IWordRecognitionRow = {
        word: "你好",
        timestamp: now,
        recognitionScore: 0,
        nextDueDate: undefined,
    };
    const rows = [r1];
    expectAndPush(rows, RecognitionMap.hard, now, 0);
    expectAndPush(rows, RecognitionMap.medium, now, 0);
    expectAndPush(rows, RecognitionMap.easy, now, 1);
    expectAndPush(rows, RecognitionMap.easy, now, 2);
    expectAndPush(rows, RecognitionMap.easy, tomorrow, 3);
    expectAndPush(rows, RecognitionMap.easy, twoDaysNext, 4);
    expectAndPush(rows, RecognitionMap.hard, now, 1);
})