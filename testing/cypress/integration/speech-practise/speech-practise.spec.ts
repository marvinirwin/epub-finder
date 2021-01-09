/// <reference types="cypress" />
import {CardList, UploadLearningDocument} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";
import {SpeechPractisePom} from "./speech-practise.pom";

const CurrentQuizCard = '#current-quiz-card';

describe('Speech Practise', () => {
    beforeEach(() => {
        cy.visitHome()
    })
    it('Navigates to an empty speech practise page ', () => {
        DirectoryPom.EnterSpeechPractise();
        SpeechPractisePom.RecordingSineWave()
            .should('not.have.class', 'recording');
        SpeechPractisePom.RecordButton()
            .should('not.have.class', 'recording');
        SpeechPractisePom.LoadingIndicator()
            .should('not.have.class', 'loading')
    });
    it('Can select a language', () => {
        SpeechPractisePom
            .LanguageSelect()
            .select('Simplified Chinese (Mandarin)')
    });
    it('Enters intended learning and the others populated', () => {
    });
    it('Enters intended known and the others populated', () => {
    });
    it('Enters intended romanized the others populated', () => {
    });
    it('Says the correct thing, success class, sound and romanized/speech populate', () => {
    });
})


