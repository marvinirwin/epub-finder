import {Run} from "../Util/Run";
import {CausalTree} from "../Graph/CausalTree";

require('jest-localstorage-mock');

it("Loads the manager without error", () => {
    Run((
        {
            manager: {
                quizManager: {
                    scheduledCards$,
                    quizzingCard$
                },
                bookFrameManager: {
                    addReadingBookFrame$
                },
                quizCharacterManager: {
                    exampleSentences$
                }
            },
            scheduler,
            helpers: {
                hot
            }
        }
    ) => {
        scheduler
            .expectOrderings(
                {
                    addReadingBookFrame$,
                    quizzingCard$,
                    scheduledCards$: scheduledCards$.obs$,
                    exampleSentences$: exampleSentences$.obs$,

                },
                CausalTree.init(`
          sentences
             ^
             |
        quizzingCard
             ^
             |
       scheduledCards
             ^
             |
             |
    addReadingBookFrame$.next(mainPage)
    `, {
                    sentences: [
                        '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十,',
                        '一二三四五六七八九十'
                    ],
                    scheduledCards: [
                        {
                            learningLanguage: '今天',
                        }
                    ],
                    quizzingCard: {
                        learningLanguage: '今天'
                    },
                    mainPage: {
                        name: "Basic Doc"
                    },
                    addReadingBookFrame$
                })
            )
    });
});

it('Loads a page, which creates new cards, which makes a quizItem, which fetches sentences for itself', () => {

})
