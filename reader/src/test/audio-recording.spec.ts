import {MyAppDatabase} from "../lib/Storage/AppDB";
import {ScheduleManager} from "../lib/Manager/ScheduleManager";
import {map} from "rxjs/operators";
import {countFactory, Marbles, getTestScheduler} from "./Util/Util";
import {IWordCountRow} from "../lib/Interfaces/IWordCountRow";
import {AudioRecorder} from "../lib/Audio/AudioRecorder";
import {UnitTestAudio} from "../lib/Audio/UnitTestAudio";

require("fake-indexeddb/auto");

const db = new MyAppDatabase();

it('Can fulfill an Audio Recording request ', async () => {
    getTestScheduler().run((helpers) => {
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
    })
})
