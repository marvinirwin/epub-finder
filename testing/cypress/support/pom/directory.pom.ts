export class DirectoryPom {
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
        cy.get(`#library`)
            .click()
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
    public static EnterSpeechPractise() {
        return cy.get('#speech-practise')
            .click()
    }
}