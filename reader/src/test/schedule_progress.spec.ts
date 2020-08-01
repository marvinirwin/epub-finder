import {MyAppDatabase} from "../lib/Storage/AppDB";
import {ScheduleManager} from "../lib/Manager/ScheduleManager";
import {map} from "rxjs/operators";
import {TestScheduler} from 'rxjs/testing';
import {countFactory, MarbleGroup, Marbles, quizResultFactory} from "./Util/Util";
import {RecognitionMap} from "../lib/Scheduling/SRM";
import {QuizResultToRecognitionRow} from "../lib/Pipes/QuizResultToRecognitionRow";
import {QuizManager, QuizResult} from "../lib/Manager/QuizManager";
import {IWordCountRow} from "../lib/Interfaces/IWordCountRow";
import {HotObservable} from "rxjs/internal/testing/HotObservable";
import moment from "moment";
import {IWordRecognitionRow} from "../lib/Scheduling/IWordRecognitionRow";

require("fake-indexeddb/auto");
const db = new MyAppDatabase();

const testScheduler = new TestScheduler((actual, expected) => {
    // asserting the two objects are equal
    // e.g. using chai.
    expect(actual).toEqual(expected);
});

/*function constructMarbles(cb: (a: any) => any): {
    inputMarbles: string,
    inputValues: Dictionary<any>,
    outputMarbles: string,
    outputValues: Dictionary<any>
} {
    let inputMarbles = '';
    let inputValues: Dictionary<any> = {};
    let inputLetter = 'a';
    let outputMarbles = '';
    let outputValues: Dictionary<any> = {};
    let outputLetter = 'a';
    cb({
        push(v: any) {
            const letter = inputLetter;
            inputLetter = incLetter(inputLetter);
            outputMarbles += '-';
            inputMarbles += inputLetter;
            inputValues[letter] = v;
        },
        expect(v: any) {
            const letter = outputLetter;
            outputLetter = incLetter(outputLetter);
            outputMarbles += letter;
            inputMarbles += '-';
            outputValues[letter] = v;
        }
    })
    return {
        inputMarbles,
        inputValues,
        outputMarbles,
        outputValues
    }
}*/

function quizResultCountRows<T>(hot: <T = string>(marbles: string, values?: { [p: string]: T }, error?: any) => HotObservable<T>, addQuizResultMarbles: Marbles<QuizResult>, scheduleManager: ScheduleManager, addCountMarbles: Marbles<IWordCountRow[]>) {
}

it('Sorts cards into New and out ofn ew', () => {
    testScheduler.run(helpers => {
        const scheduleManager = new ScheduleManager(db);
        const quizManager = new QuizManager();
        const addQuizResultMarbles = Marbles.new<QuizResult>(helpers)
            .setTargetSubject(quizManager.completedQuizItem$);
        const addCountMarbles = Marbles.new<IWordCountRow[]>(helpers);
        const expectNewCardsMarbels = Marbles.new<number>(helpers)
            .setExpectedObservable(scheduleManager.newCards$.pipe(map(wordsList => wordsList.length)));

        addCountMarbles.addValue([countFactory('今天')]);
        expectNewCardsMarbels.addValue(0, 1);

        addQuizResultMarbles.addTime(4);
        addQuizResultMarbles.addValue(quizResultFactory('今天', RecognitionMap.easy));
        expectNewCardsMarbels.addValue(0);
    });
})

it('Sorts cards into Learning and out of learning', () => {
    testScheduler.run(helpers => {
        const {hot, expectObservable} = helpers;
        const scheduleManager = new ScheduleManager(db);
        const addQuizResultMarbles =
            Marbles.new<QuizResult, IWordRecognitionRow[]>(helpers)
                .setPipe(QuizResultToRecognitionRow(scheduleManager.wordScheduleRowDict$, scheduleManager.ms))
                .setTargetSubject(scheduleManager.addPersistedWordRecognitionRows$);

        const addCountMarbles = Marbles.new<IWordCountRow[]>(helpers)
            .setTargetSubject(scheduleManager.addWordCountRows$);

        const expectLearningCardsMarbles = Marbles.new<number>(helpers)
            .setExpectedObservable(scheduleManager.learningCards$.pipe(map(wordsList => wordsList.length)));

        addCountMarbles.addValue([countFactory('今天')]);
        expectLearningCardsMarbles.addValue(0, 0);// Always push 0 for replaySubjects

        addQuizResultMarbles.addTime(4);
        addQuizResultMarbles.addValue(quizResultFactory('今天', RecognitionMap.easy));
        expectLearningCardsMarbles.addValue(1);

        // After this I expect that these two cards have been successfully "learned"
        addQuizResultMarbles.addValue(quizResultFactory('今天', RecognitionMap.easy));
        expectLearningCardsMarbles.addValue(0);
    });
})

it('Sorts cards into To Review and out of To Review', () => {
    testScheduler.run(helpers => {
        const {hot, expectObservable} = helpers;
        const scheduleManager = new ScheduleManager(db);
        const quizManager = new QuizManager();
        const addQuizResultMarbles = Marbles.new<QuizResult>(helpers).setTargetSubject(quizManager.completedQuizItem$);
        const addCountMarbles = Marbles.new<IWordCountRow[]>(helpers).setTargetSubject(scheduleManager.addWordCountRows$);
        const expectToReviewMarbles = Marbles.new<number>(helpers).setExpectedObservable(scheduleManager.toReviewCards$.pipe(map(wordsList => wordsList.length)));
        const wordRecognitionRows = Marbles.new<IWordRecognitionRow[]>(helpers).setTargetSubject(scheduleManager.addPersistedWordRecognitionRows$);

        addCountMarbles.addValue([countFactory('今天')]);
        expectToReviewMarbles.addValue(0);
        addQuizResultMarbles.addTime(3);
        wordRecognitionRows.addTime(3)

        wordRecognitionRows.addValue([
            {
                word: '今天',
                timestamp: moment().subtract(1, 'day').toDate(),
                nextDueDate: moment().subtract(1, 'day').toDate(),
                recognitionScore: 0,
                id: -1,
            },
            {
                word: '今天',
                timestamp: moment().subtract(1, 'day').toDate(),
                nextDueDate: moment().subtract(1, 'day').toDate(),
                recognitionScore: 1,
                id: -1
            },
        ])
        expectToReviewMarbles.addValue(1);
        wordRecognitionRows.addValue([
            {
                word: '今天',
                timestamp: new Date(),
                recognitionScore: 0,
                nextDueDate: moment().subtract(1, 'day').toDate(),
                id: -1
            },
        ]);
        expectToReviewMarbles.addValue(0);
    })
})

it('Always has a card to quiz me on', () => {
    testScheduler.run(helpers => {
        const scheduleManager = new ScheduleManager(db);
        const m = new MarbleGroup(
            Marbles.new<QuizResult, IWordRecognitionRow[]>(helpers)
                .setPipe(QuizResultToRecognitionRow(scheduleManager.wordScheduleRowDict$, scheduleManager.ms))
                .setTargetSubject(scheduleManager.addPersistedWordRecognitionRows$),
            Marbles.new<IWordCountRow[]>(helpers)
                .setTargetSubject(scheduleManager.addWordCountRows$),
            Marbles.new<string | undefined>(helpers)
                .setExpectedObservable(scheduleManager.nextWordToQuiz$)
        );
        m.tick(
            m.skip(),
            [undefined, [countFactory('今天'), countFactory('你好')]],
            '今天'
        );
        m.tick(
            quizResultFactory('今天', RecognitionMap.easy),
            m.skip(),
            m.skip()
        )
        m.print()
        m.done()
    })
})