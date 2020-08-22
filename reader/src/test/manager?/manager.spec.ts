import {Run, UnitTestGetPageSrc} from "../Util/Run";
import {CausalTree} from "../Graph/CausalTree";
import {Website} from "../../lib/Website/Website";

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
                    mainPage: new Website(
                        "Basic Doc",
                        "BasicDoc.html",
                        UnitTestGetPageSrc
                    ),
                    addReadingBookFrame$
                })
            )
    });
});

