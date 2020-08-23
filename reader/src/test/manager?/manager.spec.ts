import {Run, UnitTestGetPageSrc} from "../Util/Run";
import {CausalTree} from "../Graph/CausalTree";
import {Website} from "../../lib/Website/Website";
import {NavigationPages} from "../../lib/Util/Util";

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
                openedBooksManager: {
                    addOpenBook$
                },
                quizCharacterManager: {
                    exampleSentences
                },
                cardManager: {
                    addUnpersistedCards$,
                    trie$
                },
                audioManager: {
                    audioRecorder: {
                        recordRequest$
                    }
                },
                bottomNavigationValue$,
                viewingFrameManager: {
                    elementsInView$
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
                    exampleSentences$: exampleSentences.obs$,
                    recordRequest$,
                    bottomNavigationValue$
                },
                CausalTree.init(`
    bottomNavigationValue$.next(READING_PAGE)
        ^
    exampleSentences
        ^
    addOpenBook$.next(mainPage)
    `,
                    {
                    exampleSentences: [
                        {
                            translatableText: '\n' +
                                '    一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十'
                        },
                    ],
                    mainPage: new Website(
                        "Basic Doc",
                        "BasicDoc.html",
                        UnitTestGetPageSrc
                    ),
                    addOpenBook$,
                    bottomNavigationValue$,
                    READING_PAGE: NavigationPages.READING_PAGE
                })
            )
    });
});

