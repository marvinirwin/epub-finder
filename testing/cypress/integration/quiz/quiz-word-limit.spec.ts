import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCarouselPom} from "./quiz-carousel.pom";
import {newWordLimitInput, QUIZ_BUTTON_EASY} from "@shared/*";

class SettingsPom {
    static SetNewQuizWordLimit(newLimit: number) {
        DirectoryPom.OpenSettings();
        cy.get(`#${newWordLimitInput}`).clear().type(`${newLimit}`)
    }
}

describe(`Limiting a user's new words every day`, () => {
    it('Stops a user from learning more than 2 new words a day if 2 is the limit', () => {
        cy.visitHome();
        SettingsPom.SetNewQuizWordLimit(2);
        DirectoryPom.OpenQuiz();
        QuizCarouselPom.reveal();
        QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY)
        QuizCarouselPom.reveal();
        QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY)
        QuizCarouselPom.assertNoQuizCard();
    })
})