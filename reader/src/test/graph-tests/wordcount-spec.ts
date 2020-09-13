import {Run} from "../Util/Run";
import {CausalTree} from "../Graph/CausalTree";

it("Generates wordCountRecords for a page", () => {
    Run((
        {
            manager: {
                openedBooks: {
                    addOpenBook$
                },
            },
            scheduler,
        }
    ) => {
        scheduler
            .expectOrderings(
                {
                    addOpenBook$,
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
    addOpenBook$.next(mainPage)
    `, {
                    quizzingCard: {
                        learningLanguage: '今天'
                    },
                    mainPage: {
                        name: "Basic Doc"
                    },
                    addOpenBook$
                })
            )
    });
});
