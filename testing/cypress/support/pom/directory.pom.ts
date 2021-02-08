/// <reference types="cypress" />
import {documentSelectionRow, LIBRARY, PAGES} from '@shared/*'

export class DirectoryPom {
    public static visitPage(page: PAGES) {
        cy.visit(`http://localhost:3000/?test=1&skip_intro=1&page=${page}`);
    }

    public static goToQuiz() {
        cy.get('#quiz.tree-menu-node').click();
    }

    public static SubmitManualSpeechRecognition(result: string) {
        cy.get('#manual-speech-recognition-input')
            .type(result);
        cy.get('#submit-manual-speech-recognition')
            .click()
    }

    public static SetIsRecording(isRecording: boolean) {
        if (isRecording) {
            cy.get('#manual-is-recording')
                .check()
        } else {
            cy.get('#manual-is-recording')
                .uncheck()
        }
    }

    public static ClearSpeechRecognitionRecords() {
        cy.get('#clear-speech-recognition-rows')
            .click()
    }

    public static EnterLibrary() {
        cy.get(`#${LIBRARY}`).click()
    }

    public static Back() {
        cy.get('#tree-menu-node-back-button')
            .click()
    }

    public static EnterSettings() {
        cy.get(`#settings`)
            .click()
    }

    public static SetDailyGoal(n: number) {
        const s = '#daily-goal-input';
        cy.get(s)
            .click()
            .focused()
            .clear()
            .type(`${n}`);
    }

    public static DailyProgressLabel() {
        return cy.get('#daily-goal-label')
    }

    public static EnterSpeechPractice() {
        return cy.get('#speech-practice')
            .click()
    }

    public static signout() {
        return cy.get('#signOut').click()
    }

    public static setWatchMode(on: boolean) {
        return cy.get('#watch-mode-icon').then(el => {
            const isCurrentlyOn = el.hasClass('video-mode-icon-on');
            if (isCurrentlyOn !== on) {
                cy.wrap(el).click()
            }
        })
    }

    public static openUploadDialog() {
        cy.get('#uploadLearningMaterial').click();
    }

    public static CloseAllDialogs() {
        cy.get('body').trigger('keydown', {key: 'Escape'})
        cy.get('.action-modal').should('not.exist');
        // cy.get('.action-modal > .MuiBackdrop-root').click({force: true});
    }

    public static SelectDocumentToRead(documentName: string) {
        DirectoryPom.CloseAllDialogs()
        DirectoryPom.EnterLibrary()
        cy.contains(`.${documentSelectionRow}`, documentName).click()
    }
}