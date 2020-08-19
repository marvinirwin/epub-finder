import {Run} from "../Util/Run";
import {AsciiGraph} from "../Util/ASCIIGraph";

require('jest-localstorage-mock');

it("Loads the manager without error", () => {
    Run((
        {
            manager: {
                quizManager: {
                    scheduledCards$,
                    quizzingCard$
                },
                pageManager: {
                    addPage$
                }
            },
            scheduler,
            helpers: {
                hot
            }
        }
    ) => {
        let valueMap = {
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
            addPage$
        };
        let orderables = AsciiGraph.getOrderables(`addPage$.next(mainPage)--->scheduledCards--->quizzingCard `, valueMap);
        scheduler
            .expectOrderings(
                [addPage$, hot('------a')],
                orderables.lastEmissionRoots,
                valueMap,
                orderables.firstEmissionRoots
            )
    });
});
