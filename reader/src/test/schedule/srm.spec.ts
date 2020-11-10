import {WordRecognitionRow} from "../../lib/Scheduling/WordRecognitionRow";
import moment from 'moment';
import {RecognitionMap, SRM} from "../../lib/Scheduling/SRM";

const sm = new SRM();

const r1: WordRecognitionRow = {
    word: "你好",
    timestamp: new Date(),
    recognitionScore: 0,
    nextDueDate: undefined,
};

function expectAndPush(
    rows: WordRecognitionRow[],
    difficulty: number,
    expectedDay: Date | moment.Moment,
    expectedScore: number
) {
    const row = sm.getNextRecognitionRecord(rows, difficulty, new Date());
    expect(moment(row.nextDueDate).isSame(expectedDay, 'day'));
    expect(row.recognitionScore).toBe(expectedScore);
    rows.push({...r1, ...row});
}

it("Schedules things correctly", async () => {
    const now = new Date();
    const tomorrow = moment(now).add(1, 'day');
    const twoDaysNext = moment(now).add(2, 'day');

    const rows = [r1];

    expectAndPush(rows, RecognitionMap.hard, now, 0);
    expectAndPush(rows, RecognitionMap.medium, now, 0);
    expectAndPush(rows, RecognitionMap.easy, now, 1);
    expectAndPush(rows, RecognitionMap.easy, now, 2);
    expectAndPush(rows, RecognitionMap.easy, tomorrow, 3);
    expectAndPush(rows, RecognitionMap.easy, twoDaysNext, 4);
    expectAndPush(rows, RecognitionMap.hard, now, 1);
})