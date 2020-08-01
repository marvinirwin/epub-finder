import {TestScheduler} from "rxjs/testing";
import {MyAppDatabase} from "../lib/Storage/AppDB";
import {Manager} from "../lib/Manager";
import {countFactory, MarbleGroup, Marbles} from "./Util/Util";
import {IWordCountRow} from "../lib/Interfaces/IWordCountRow";
import {ICard} from "../lib/Interfaces/ICard";
import {getNewICardForWord} from "../lib/Util/Util";
import {ScheduleManager} from "../lib/Manager/ScheduleManager";
import {QuizManager} from "../lib/Manager/QuizManager";
import CardManager from "../lib/Manager/CardManager";
import {ScheduleQuiz} from "../lib/Manager/ManagerConnections/Schedule-Quiz";
import {CardScheduleQuiz} from "../lib/Manager/ManagerConnections/Card-Schedule-Quiz";

require("fake-indexeddb/auto");
const db = new MyAppDatabase();
const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

it('Takes scheduleRows and puts them into the quizManager currentQuizItems', () => {
    const scheduleManager = new ScheduleManager(db);
    const quizManager = new QuizManager();
    const cardManager = new CardManager(db);
    ScheduleQuiz(scheduleManager, quizManager);
    CardScheduleQuiz(cardManager, scheduleManager, quizManager);


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
            currentQuizItem: [[getNewICardForWord('你好')]]
        });
        m.done();
    })
});
