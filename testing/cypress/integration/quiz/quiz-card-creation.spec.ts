import {DirectoryPom} from "../../support/pom/directory.pom";
import {
    QUIZ_NODE,
    QUIZ_SCHEDULE,
    quizCardTableRow, quizCardTableRowCounts,
    quizCardTableRowLastAnswer,
    quizCardTableRowRecognitions,
    quizCardTableRowWord
} from "@shared/";

describe('quiz card creation', () => {
    it('Does not create cards which are not from the language being studied', () => {
        DirectoryPom.visitPage(QUIZ_SCHEDULE);
    cy.get(quizCardTableRow).should(($trs: JQuery<HTMLTableRowElement>) => {
            $trs
                .map((i, tr) => {
                    const g = selector  => $(tr).find(`.${selector}`).text()
                    const word = g(quizCardTableRowWord);
                    const recognitionScores  = g(quizCardTableRowRecognitions);
                    const counts = g(quizCardTableRowCounts);
                    const latestCorrect = g(quizCardTableRowLastAnswer);
                    return {
                        word, recognitionScores, counts, latestCorrect
                    }
                })
        })
    })
})