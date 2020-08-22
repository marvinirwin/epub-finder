import {Run, UnitTestGetPageSrc} from "../Util/Run";
import {CausalTree} from "../Graph/CausalTree";
import {Website} from "../../lib/Website/Website";

require('jest-localstorage-mock');
['unhandledRejection', 'uncaughtException'].forEach(event => {
    // @ts-ignore
    process.on(event, (err: any) => {
        console.error(err);
    });
});


it("Loads the manager without error", () => {
    Run((
        {
            manager: {
                quizManager: {
                    scheduledCards$,
                    quizzingCard$
                },
                bookFrameManager: {
                    addOpenBook$
                },
                quizCharacterManager: {
                    exampleSentences$
                },
                cardManager: {
                    addUnpersistedCards$
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
                    addOpenBook$,
                    quizzingCard$,
                    scheduledCards$: scheduledCards$.obs$,
                    exampleSentences$: exampleSentences$.obs$,
                    addUnpersistedCards$
                },
                CausalTree.init(`
    sentences
        ^
    quizzingCard
        ^
    scheduledCards
        ^
    addOpenBook$.next(mainPage)
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
                    addOpenBook$
                })
            )
    });
});

