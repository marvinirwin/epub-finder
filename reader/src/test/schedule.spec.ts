import {MyAppDatabase} from "../lib/Storage/AppDB";
import {ScheduleManager} from "../lib/Manager/ScheduleManager";
import {RecognitionMap} from "../lib/Scheduling/SRM";
import {skip, take} from "rxjs/operators";
import moment from "moment";

require("fake-indexeddb/auto");
const db = new MyAppDatabase();

it('Creates a table row for an unpersisted recognitionRow and gives it a due date', async () => {
    const scheduleManager = new ScheduleManager(db);
    const sortedRows = scheduleManager.wordsSorted$.pipe(skip(1), take(1)).toPromise();
    scheduleManager.addUnpersistedWordRecognitionRows$.next([
        {
            word: '你好',
            timestamp: new Date(),
            recognitionScore: RecognitionMap.medium
        },
        {
            word: '今天',
            timestamp: new Date(),
            recognitionScore: RecognitionMap.easy
        }
    ]);

    const rows = (await sortedRows);
    const row = rows[0];
    const row2 = rows[1];

    expect(moment(row.wordRecognitionRecords[0].nextDueDate).isSame(new Date(), 'day'));
    expect(row.word).toBe('你好');

    expect(moment(row2.wordRecognitionRecords[0].nextDueDate).isSame(new Date(), 'day'));
    expect(row2.word).toBe('今天');
})