/// <reference types="cypress" />
import {fileChooser} from "../constants";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {UploadLearningDocument} from "../quiz/quiz.document";
import {ReadingPom} from "../../support/pom/reading.pom";


describe('Highlighting speech recognition results', () => {
    beforeEach(() => {
        cy.clearIndexedDB();
    })
    it('Highlights words when results are submitted', () => {
        UploadLearningDocument();
        DirectoryPom.SubmitManualSpeechRecognition('的一是');
        // Assert that one character is highlighted
        ReadingPom
            .RenderedSegments()
            .contains('的一是')
            .find('mark')
            .should('not.have.css', 'background-color', 'transparent');

        ReadingPom
            .RenderedSegments()
            .contains(/^的一$/)
            .find('mark')
            .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
    })
})


