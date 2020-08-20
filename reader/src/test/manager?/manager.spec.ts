import {Run} from "../Util/Run";
import {AddPageScheduleCardsQuizzingCard} from "../causal-trees/addPage-scheduleCards-quizzingCard";

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
                    addPage$,
                    quizzingCard$,
                    scheduledCards$,
                    exampleSentences$: exampleSentences$.obs$,
                },
                AddPageScheduleCardsQuizzingCard(addPage$)
            )
    });
});

it('Loads a page, which creates new cards, which makes a quizItem, which fetches sentences for itself', () => {

})
