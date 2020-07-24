import {MyAppDatabase} from "../lib/Storage/AppDB";
import {ScheduleManager} from "../lib/Manager/ScheduleManager";
import {map} from "rxjs/operators";
import {TestScheduler} from 'rxjs/testing';
import {countFactory, Marbles, recognitionFactory} from "./Util/Util";

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

it('Sorts cards into New, Learning and To Review', () => {
    testScheduler.run(helpers => {
        const {cold, hot, expectObservable, expectSubscriptions} = helpers;
        const scheduleManager = new ScheduleManager(db);
        const expect = [];

        const addWordRecognitionMarbles = new Marbles();
        const addCountMarbles = new Marbles();
        const expectNewCardsMarbels = new Marbles();

        addCountMarbles.push([ countFactory('今天'), countFactory('今天') ]);
        expectNewCardsMarbels.push(2);
        addWordRecognitionMarbles.addTime();

        addWordRecognitionMarbles.push([recognitionFactory('你好'), recognitionFactory('今天')]);
        expectNewCardsMarbels.addTime();

        hot(addWordRecognitionMarbles.getMarbles(), addWordRecognitionMarbles.values)
            .subscribe(scheduleManager.addPersistedWordRecognitionRows$);
        hot(addCountMarbles.getMarbles(),addCountMarbles.values)
            .subscribe(scheduleManager.addWordCountRows$)
        expectObservable(
            scheduleManager.newCards$.pipe(map(wordsList => wordsList.length))
        ).toBe(expectNewCardsMarbels.getMarbles(), expectNewCardsMarbels.values)
    });
})
