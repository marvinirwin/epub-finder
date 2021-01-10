/// <reference types="cypress" />
import {DirectoryPom} from "../../support/pom/directory.pom";
import {SpeechPracticePom} from "./speech-practice.pom";

const CurrentQuizCard = '#current-quiz-card';

describe('Speech Practice', () => {
    beforeEach(() => {
        cy.visitHome()
    })
    it('Navigates to an empty speech Practice page ', () => {
        DirectoryPom.EnterSpeechPractice();
        SpeechPracticePom.RecordingIndicator()
            .should('not.have.class', 'recording')
    });
    it('Records text and romanization and translation are populated', () => {
        const result = "你好";
        DirectoryPom.SubmitManualSpeechRecognition(result);
        DirectoryPom.EnterSpeechPractice();
        SpeechPracticePom.LearningLanguage().should('contain', result);
        SpeechPracticePom.Romanized().should('contain', 'Nǐ hǎo');
        SpeechPracticePom.Translated().should('contain', 'Hello there');
    })
})


