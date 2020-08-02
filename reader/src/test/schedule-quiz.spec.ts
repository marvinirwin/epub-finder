import {TestScheduler} from "rxjs/testing";
import {MyAppDatabase} from "../lib/Storage/AppDB";
import {Manager} from "../lib/Manager";
import {countFactory, MarbleGroup, Marbles, ScheduleQuizCard} from "./Util/Util";
import {IWordCountRow} from "../lib/Interfaces/IWordCountRow";
import {ICard} from "../lib/Interfaces/ICard";
import {getNewICardForWord} from "../lib/Util/Util";

require("fake-indexeddb/auto");
const db = new MyAppDatabase();
const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

it('Takes scheduleRows and puts them into the quizManager currentQuizItems', () => {
    const {scheduleManager, quizManager, cardManager} = ScheduleQuizCard(db);

    testScheduler.run(helpers => {
        const m = new MarbleGroup(
            {
                addPersistedCards: Marbles.new<ICard[]>(helpers)
                    .setTargetSubject(cardManager.addPersistedCards$),

                addCountRecords: Marbles.new<IWordCountRow[]>(helpers)
                    .setTargetSubject(scheduleManager.addWordCountRows$),

                currentQuizItem: Marbles.new<ICard | undefined>(helpers)
                    .setExpectedObservable(quizManager.currentQuizItem$),
            },
        );
        m.tick({
            addPersistedCards: [[getNewICardForWord('你好')]],
            addCountRecords: [[countFactory('你好')]],
            currentQuizItem: getNewICardForWord('你好')
        });
        m.done();
    })
});
