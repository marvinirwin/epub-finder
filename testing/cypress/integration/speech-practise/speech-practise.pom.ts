export class SpeechPractisePom {
    public static RecordingSineWave() {
        return cy.get('#speech-practise-recording-sine-wave')
    }
    public static LearningLanguage() {
        return cy.get('#speech-practise-learning-language')
    }
    public static Romanized() {
        return cy.get('#speech-practise-romanized')
    }
    public static Translated() {
        return cy.get('#speech-practise-translated')
    }
    public static Intended() {
        return cy.get('#speech-practise-intended-learning-language')
    }
    public static IntendedRomanized() {
        return cy.get('#speech-practise-intended-romanized')
    }
    public static IntendedTranslated() {
        return cy.get('#speech-practise-intended-translated')
    }
    public static RecordButton () {
        return cy.get('#speech-practise-record-button')
    }
    public static LoadingIndicator() {
        return cy.get('#speech-practise-loading-indicator')
    }
    public static LanguageSelect() {
        return cy.get('#speech-practise-language-select')
    }
}
