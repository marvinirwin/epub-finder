/// <reference types="cypress" />
import {documentSelectionRow, fileChooser} from "../constants";
import {getIframeBody} from "../iframe.service";

const CurrentQuizCard = '#current-quiz-card';

function UploadLearningDocument() {
    cy.get(fileChooser).attachFile('test_quiz.html');
    cy.contains(documentSelectionRow, 'test_quiz')
        .should('have.class.reading');
}

function NavigateToQuizPage() {
    cy.get('#quiz-directory').click();
}

function GetCurrentQuizCard() {
    return cy.get(CurrentQuizCard);
}

function QuizText(mostCommonWord: string) {
    GetCurrentQuizCard()
        .contains('.quiz-text', mostCommonWord)
        .should('exist');
}

const mostCommonWord = '热门';
const targetSrc = 'somepicture';
const newMeaning = '';

function QuizImage() {
    GetCurrentQuizCard()
        .find('#quiz-picture')
        .should('have.attr', 'src').should('include', targetSrc);
}

function ExampleSentences(exampleSentences: string[]) {
    for (let i = 0; i < exampleSentences.length; i++) {
        const exampleSentence = exampleSentences[i];
        getIframeBody('#current-example-sentence-iframe')
            .contains('.example-sentence', exampleSentence)
    }
}

function HideButton() {
    GetCurrentQuizCard()
        .find('.hide-card')
        .should('exist');
}

function EasyButton() {
    GetCurrentQuizCard()
        .find('.quiz-difficulty-easy')
        .should('exist');
}
const exampleSentences = ['热门'];

function MediumButton() {
    GetCurrentQuizCard()
        .find('.quiz-difficulty-medium')
        .should('exist');
}

function HardButton() {
    GetCurrentQuizCard()
        .find('.quiz-difficulty-hard')
        .should('exist');
}

function ButtonExist() {
    HideButton();
    EasyButton();
    MediumButton();
    HardButton();
}

function EditCardText() {
    GetCurrentQuizCard()
        .find('.known-language')
        .find('.edit-icon')
        .click();

    // Now edit the text and unfocus
    GetCurrentQuizCard()
        .find('.known-language')
        .type(newMeaning);

    // Now wait for editing to disappear
    GetCurrentQuizCard()
        .find('.known-language.editing')
        .should('not.exist');
}

function EditCardImage() {
    GetCurrentQuizCard()
        .find('.image-container')
        .find('.edit-icon')
        .click();

    cy.get('.image-search-modal')
        .find('.image-search-result')
        .should('exist')

    cy.get('.image-search-modal')
        .find('.image-search-result')
        .click();

    // Now assert we have an image we clicked
    GetCurrentQuizCard()
        .find('.image')
        .should('have.attr', 'src').should('include', targetSrc);
}

describe('File Uploading', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/?test=1&skip_intro=1')
            .signupLogin()
            .get(fileChooser).should('not.be.disabled');
    })
    it('Prompts user for quizzes', () => {
        UploadLearningDocument();
        NavigateToQuizPage();
        QuizText(mostCommonWord);
        QuizImage();
        ExampleSentences(exampleSentences);
        ButtonExist();
        EditCardText();
        EditCardImage();

        // Now test all transitions
        // Test the hide part
        // Test easy/medium/hard and test their influence on the table page

        // Oh and test a daily goal thing
    })
    /*
        it('Uploads docx', () => {
            cy.get(fileChooser).attachFile('test_docx.docx');
            cy.contains(documentSelectionRow, 'test_docx')
        })
    */
    /*
        it('Uploads text', () => {
            cy.get(fileChooser).attachFile('test_txt.txt');
            cy.contains(documentSelectionRow, 'test_txt')
        })
        it('Uploads html', () => {
            cy.get(fileChooser).attachFile('test_html.html');
            cy.contains(documentSelectionRow, 'test_html')
        })
    */
})
