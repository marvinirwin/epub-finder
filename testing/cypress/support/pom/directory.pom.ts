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
    public static ClearSpeechRecognitionRecords() {
        cy.get('#clear-speech-recognition-rows')
            .click()
    }
    public static EnterLibrary() {
        cy.contains('.tree-menu-node', 'Library')
            .click()
    }
    public static ExitLibrary() {
        cy.get('#tree-menu-node-back-button')
            .click()
    }
}