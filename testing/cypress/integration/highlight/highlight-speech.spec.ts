/// <reference types="cypress" />
import {fileChooser} from "../constants";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {UploadLearningDocument} from "../quiz/quiz.document";

const CurrentQuizCard = '#current-quiz-card';

describe('Highlighting speech recognition results', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/?test=1&skip_intro=1')
            .signupLogin()
            .get(fileChooser).should('not.be.disabled');
    })
    it('Highlights words when results are submitted', () => {
        UploadLearningDocument();
        DirectoryPom.SubmitManualSpeechRecognition('的一是');
        // Assert that one character is highlighted


    })
})


