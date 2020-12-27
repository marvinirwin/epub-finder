/// <reference types="cypress" />
import {fileChooser} from "../constants";
import {CardList, UploadLearningDocument} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";

const CurrentQuizCard = '#current-quiz-card';

describe('Quiz Cards', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/?test=1&skip_intro=1')
            .signupLogin()
            .get(fileChooser).should('not.be.disabled');
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


