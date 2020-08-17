import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {ScheduleManager} from "../../lib/Manager/ScheduleManager";
import {map, skip, take} from "rxjs/operators";
import moment from "moment";
import {countFactory, Marbles} from "../Util/Util";
import {TestScheduler} from "rxjs/testing";
import {IWordCountRow} from "../../lib/Interfaces/IWordCountRow";

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
    testScheduler.run((helpers) => {
        const scheduleManager = new ScheduleManager(db);
        const sortedRowsWordsMarbles = Marbles.new<string[]>(helpers)
            .setExpectedObservable(scheduleManager.newCards$.pipe(map(scheduleRows => scheduleRows.map(w => w.word))));
        const countMarbles = Marbles.new<IWordCountRow[]>(helpers)
            .setTargetSubject(scheduleManager.addWordCountRows$);
        countMarbles.addValue([
            countFactory('你好'),
            countFactory('今天'),
        ])
        sortedRowsWordsMarbles.addValue(
            []
            ,[
                '你好',
                '今天'
            ]
        );
        sortedRowsWordsMarbles.done();
        countMarbles.done()
    })
})