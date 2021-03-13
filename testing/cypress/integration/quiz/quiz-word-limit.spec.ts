import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCarouselPom} from "./quiz-carousel.pom";
import {newWordLimitInput, QUIZ_BUTTON_EASY} from "@shared/*";

class SettingsPom {
    static SetNewQuizWordLimit(newLimit: number) {
        DirectoryPom.OpenSettings();
        const limitInputSelector = `#${newWordLimitInput}`;
        cy.get(limitInputSelector).invoke('val', '0');
        cy.get(limitInputSelector).click().clear().type(`${newLimit}`);
        DirectoryPom.CloseAllDialogs();
    }
}

describe(`Limiting a user's new words every day`, () => {
    it('Stops a user from learning more than 2 new words a day if 2 is the limit', () => {
        cy.visitHome();
        DirectoryPom.OpenQuiz()
        QuizCarouselPom.unLearned().should('have.value', '3');
        QuizCarouselPom.leftToday().should('have.value', '3');
        DirectoryPom.OpenQuiz();
        QuizCarouselPom.reveal();
        QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY);
        QuizCarouselPom.learningNumber().should('have.value', '1');
        QuizCarouselPom.toReviewNumber().should('have.value', '0');
        QuizCarouselPom.unLearned().should('have.value', '2');

        QuizCarouselPom.reveal();
        QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY)
        QuizCarouselPom.assertNoQuizCard();
    })
})