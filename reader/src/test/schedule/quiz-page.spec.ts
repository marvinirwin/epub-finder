import {DatabaseService} from "../../lib/Storage/database.service";
import {TestScheduler} from "rxjs/testing";
import {countFactory, MarbleGroup, Marbles, ScheduleQuizCard} from "../Util/Util";
import {ICard} from "../../lib/Interfaces/ICard";
import {BookWordCount} from "../../lib/Interfaces/BookWordCount";
import {cardForWord} from "../../lib/Util/Util";
import {QuizComponent, QuizResult} from "../../lib/Manager/QuizManager";
import {SubjectSubscriber} from "rxjs/internal/Subject";
import {Characters} from "../../components/Quiz/Characters";
import {RecognitionMap} from "../../lib/Scheduling/SRM";
import {distinct, distinctUntilChanged, map} from "rxjs/operators";
import {Pictures} from "../../components/Quiz/Pictures";
import {Conclusion} from "../../components/Quiz/Conclusion";

require("fake-indexeddb/auto");
const db = new DatabaseService();
console.warn = function () {
};

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected)
});


it('Uses schedule rows to continuously populate the current quiz item', () => {
    testScheduler.run(helpers => {
        const {scheduleManager, quizManager, cardManager} = ScheduleQuizCard(db);
        const m = new MarbleGroup(
            {
                addPersistedCards: Marbles.new<ICard[]>(helpers)
                    .setTargetSubject(cardManager.addPersistedCards$),

                addCountRecords: Marbles.new<BookWordCount[]>(helpers)
                    .setTargetSubject(scheduleManager.addWordCountRows$),


                completeQuiz: Marbles.new<QuizResult>(helpers)
                    .setTargetSubject(({word, score}) => {
                        quizManager.completeQuiz(word, score);
                    }),

                advanceQuiz: Marbles.new<void>(helpers)
                    .setTargetSubject(quizManager.advanceQuizStage$),

                sortedScheduleWords: Marbles.new<string[]>(helpers)
                    .setExpectedObservable(scheduleManager.sortedScheduleRows$.pipe(map(rows => rows.map(row => row.word)))),

                quizComponent: Marbles.new<QuizComponent>(helpers)
                    .setExpectedObservable(quizManager.quizzingComponent$),

                quizWord: Marbles.new<string | undefined>(helpers)
                    .setExpectedObservable(
                        quizManager.quizzingCard$.pipe(
                            map(currentQuizItem => currentQuizItem?.learningLanguage),
                            distinctUntilChanged()
                        ),
                    ),
            },
        );
        const word1 = '你好';
        const word2 = '今天';
        m.tick({
            // Populate schedule rows
            addPersistedCards: [[cardForWord(word1)]],
            addCountRecords: [[countFactory(word1, 2), countFactory(word2)]],
            // Expect a quiz component to be there
            quizComponent: Characters,
            quizWord: word1,
            sortedScheduleWords: [[], [word1, word2]]
        });
        m.print()
        m.tick({
            // Advance the component and press "Easy"
            quizComponent: Pictures,
            advanceQuiz: undefined,
            sortedScheduleWords: [[word2, word1]],
        })
        m.tick({
            quizComponent: Conclusion,
            advanceQuiz: undefined,
        })
        m.tick({
            // Press "Easy"
            completeQuiz: {word: word1, score: RecognitionMap.easy},
        });
        m.tick({
            completeQuiz: {
                word: word1,
                score: RecognitionMap.easy
            },
        })
        m.tick({
            // Expect changes in the new quiz component
            quizComponent: Characters,
            // Expect changes in the schedule row ordering
            // Expect changes in the new quiz item
            quizWord: word2
        })
        m.done();
    })
})
