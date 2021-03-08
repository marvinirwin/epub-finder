/// <reference types="cypress" />
import {CardList, UploadLearningDocument} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";

const CurrentQuizCard = '#current-quiz-card';

describe('The progress display', () => {
    beforeEach(() => {
        cy.signupLogin()
    })
    it('Shows the denominator of daily progress correctly', () => {
        DirectoryPom.OpenSettings();
        DirectoryPom.SetDailyGoal(50);
        DirectoryPom.Back()
        DirectoryPom.DailyProgressLabel().should('contain', 'Daily Progress: 0 / 50')
    })
})


