export class SpeechPracticePom {
    public static RecordingIndicator() {
        return cy.get('#speech-practice-recording-indicator')
    }

    public static LearningLanguage() {
        return cy.get('#speech-practice-learning-language')
    }

    public static Romanized() {
        return cy.get('#speech-practice-romanization')
    }

    public static Translated() {
        return cy.get('#speech-practice-translate')
    }
}
