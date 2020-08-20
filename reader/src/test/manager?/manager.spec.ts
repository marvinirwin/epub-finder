import {Run} from "../Util/Run";
import {AsciiGraph} from "../Util/ASCIIGraph";
import {getOrderables} from "../Graph/CasuallyOrderable";
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

        const causalTree = new CausalTree(
            new AsciiGraph( `addPage$.next(mainPage)--->scheduledCards--->quizzingCard`).edges,
            valueMap
        )
        scheduler
            .expectOrderings(
                [addPage$, hot('------a')],
                causalTree.getLastEmissionRoots(),
                causalTree.valueMap,
                causalTree.getFirstEmissionRoots()
            )
    });
});
