/// <reference types="cypress" />
import {fileChooser} from "../constants";
import {CardList, UploadLearningDocument} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";

const CurrentQuizCard = '#current-quiz-card';

describe('Quiz Cards', () => {
    beforeEach(() => {
            cy.signupLogin()
    })
    it('Shows the correct card body', () => {
        UploadLearningDocument();
        DirectoryPom.goToQuiz();
        const card = new QuizCardPom(CurrentQuizCard);
        const {characters, description, image} = CardList[0];
        card.characters().should('contain', characters);
        card.editDescription('test');
        card.selectNewImage()
    })
})


