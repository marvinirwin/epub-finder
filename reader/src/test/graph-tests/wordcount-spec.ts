import {Run} from "../Util/Run";
import {CausalTree} from "../Graph/CausalTree";

it("Generates wordCountRecords for a page", () => {
    Run((
        {
            manager: {
                bookFrameManager: {
                    addReadingBookFrame$
                },
            },
            scheduler,
        }
    ) => {
        scheduler
            .expectOrderings(
                {
                    addReadingBookFrame$,
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
