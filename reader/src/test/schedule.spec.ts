import {MyAppDatabase} from "../lib/Storage/AppDB";
import {ScheduleManager} from "../lib/Manager/ScheduleManager";
import {RecognitionMap} from "../lib/Scheduling/SRM";
import {map, skip, take} from "rxjs/operators";
import moment from "moment";
import {countFactory, Marbles} from "./Util/Util";
import {TestScheduler} from "rxjs/testing";

require("fake-indexeddb/auto");
const db = new MyAppDatabase();

it('Creates a table row for an unpersisted recognitionRow and gives it a due date', async () => {
    const testScheduler = new TestScheduler((actual, expected) => {
        if (moment.isMoment(expected)) {
            expect(moment(actual).isSame(expected, 'day'));
        } else {
            expect(actual).toEqual(expected);
        }
    });
    testScheduler.run(({cold, hot, expectObservable, expectSubscriptions}) => {
        const scheduleManager = new ScheduleManager(db);
        const sortedRowsWordsMarbles = new Marbles();
        const countMarbles = new Marbles();
        countMarbles.push([
            countFactory('你好'),
            countFactory('今天'),
        ])
        sortedRowsWordsMarbles.push(
            []
            ,[
                '你好',
                '今天'
            ]
        );
        hot(
            countMarbles.getMarbles(),
            countMarbles.values
        ).subscribe(scheduleManager.addWordCountRows$);

        expectObservable(
            scheduleManager.newCards$.pipe(map(wordsList => wordsList.map(word => word.word)))
        ).toBe(sortedRowsWordsMarbles.getMarbles(), sortedRowsWordsMarbles.values)
    })
})