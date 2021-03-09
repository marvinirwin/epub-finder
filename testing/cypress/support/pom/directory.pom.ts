/// <reference types="cypress" />
import {
    documentSelectionRow,
    frequencyDocumentList, PROGRESS_TREE,
    LIBRARY,
    PAGES,
    QUIZ_NODE,
    UPLOAD_LEARNING_MATERIAL,
    manualHotkeyInput,
    submitManualHotkeyButton, TESTING_UTILS, manualQuizHiddenFieldConfigId, QUIZ_SCHEDULE
} from '@shared/*'

export class DirectoryPom {
    public static visitPage(page: PAGES) {
        cy.visit(`http://localhost:3000/?test=1&skip_intro=1&page=${page}`);
    }

    public static OpenQuiz() {
        cy.get(`#${QUIZ_NODE}`).click();
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

    public static OpenLibraryDialog() {
        DirectoryPom.CloseAllDialogs()
        cy.wait(1000);
        cy.get(`#${LIBRARY}`).click()
    }

    public static Back() {
        cy.get('#tree-menu-node-back-button')
            .click()
    }

    public static OpenSettings() {
        DirectoryPom.CloseAllDialogs()
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

    public static OpenUploadDialog() {
        cy.wait(1000);
        cy.get(`#${UPLOAD_LEARNING_MATERIAL}`).click();
    }

    public static CloseAllDialogs() {
        cy.get('body').trigger('keydown', {key: 'Escape'})
        cy.get('#global-loading-spinner').should('not.be.visible');
        // cy.get('.action-modal > .MuiBackdrop-root').click({force: true});
    }

    public static SelectDocumentToRead(documentName: string) {
        DirectoryPom.OpenLibraryDialog()
        cy.wait(1000);
        cy.contains(`.${documentSelectionRow}`, documentName).click()
    }

    static SelectFrequencyDocuments(...frequencyDocumentNames: string[]) {
        DirectoryPom.OpenLibraryDialog();
        frequencyDocumentNames.forEach(frequencyDocumentName => {
            cy.get(frequencyDocumentList)
                .find(`#${frequencyDocumentName}`)
                .click()
        })
    }

    static OpenProgressTree() {
        DirectoryPom.CloseAllDialogs()
        cy.get(`#${PROGRESS_TREE}`).click()
    }

    static PressHotkey(hotkey: string) {
        DirectoryPom.OpenTestingUtils()
        cy.get(`#${manualHotkeyInput}`).clear().type(hotkey);
        cy.get(`#${submitManualHotkeyButton}`).click();
    }
    static OpenTestingUtils() {
        DirectoryPom.CloseAllDialogs();
        cy.get(`#${TESTING_UTILS}`).click();
    }

    static SetHiddenFields(hiddenDefinition: string) {
        DirectoryPom.OpenTestingUtils()
        cy.get(`#${manualQuizHiddenFieldConfigId}`).type(hiddenDefinition)
        DirectoryPom.CloseAllDialogs()
    }

    static OpenScheduleTable() {
        DirectoryPom.CloseAllDialogs();
        cy.get(`#${QUIZ_SCHEDULE}`).click();
    }
}