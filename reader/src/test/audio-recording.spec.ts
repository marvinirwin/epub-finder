import {MyAppDatabase} from "../lib/Storage/AppDB";
import {ScheduleManager} from "../lib/Manager/ScheduleManager";
import {map} from "rxjs/operators";
import {countFactory, Marbles, getTestScheduler, marbleValue} from "./Util/Util";
import {IWordCountRow} from "../lib/Interfaces/IWordCountRow";
import {AudioRecorder} from "../lib/Audio/AudioRecorder";
import {UnitTestAudio} from "../lib/Audio/UnitTestAudio";
import {RecordRequest} from "../lib/Interfaces/RecordRequest";

require("fake-indexeddb/auto");

const db = new MyAppDatabase();

it('Can fulfill an Audio Recording request ', async () => {
    let testScheduler = getTestScheduler();
    testScheduler.run((helpers) => {
        const r = new AudioRecorder(new UnitTestAudio("yeet"));
        /**
         * Expect a recordRequest to be followed by a true isRecording
         */
        const {hot} = helpers;
        let recordRequest = new RecordRequest('test');
        const recordRequests = hot('a', {a: recordRequest});
        const isRecording: marbleValue = {marbles: '-b', values: {b: true}};

        recordRequests.subscribe(r.recordRequest);

        testScheduler.expectOrdering(
            {observable: recordRequests, subscriptionMarbles: null},
            {observable: r.isRecording$, subscriptionMarbles: null}
        ).toBe(
            [
                {marbles: 'a', values: {a: recordRequest}},
                isRecording,
            ]
        );
/*
        const audioRecorder = new AudioRecorder(new UnitTestAudio("Test Text"));
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
*/
    })
})
