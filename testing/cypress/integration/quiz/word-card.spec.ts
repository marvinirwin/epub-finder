import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCarouselPom} from "./quiz-carousel.pom";
import {
    QUIZ_BUTTON_EASY,
    scheduleRowOpenWordButton,
    wordCardCountRecords,
    wordCardDescription, wordCardLearningLanguage,
    wordCardRecognitionRows, wordCardRomanization, wordCardTranslation
} from "@shared/*";
import {CardList} from "./quiz.document";

const firstCard = CardList[0];
class ScheduleTablePom {

    static SearchForWord(word: string) {

    }

    static firstRow() {

    }
}
class WordCardPom {
    static countRecords() {
        return cy.get(`.${wordCardCountRecords}`)
    }

    static recognitionRecords() {
        return cy.get(`.${wordCardRecognitionRows}`)
    }

    static description() {
        return cy.get(`.${wordCardDescription}`)
    }

    static learningLanguage() {
        return cy.get(`.${wordCardLearningLanguage}`)
    }

    static romanization() {
        return cy.get(`.${wordCardRomanization}`)
    }

    static translation() {
        return cy.get(`.${wordCardTranslation}`)
    }
}

describe('A card containing all information about a word', () => {
    it('Contains all expected fields', () => {
        cy.visitHome();
    DirectoryPom.OpenQuiz();
    QuizCarouselPom.reveal();
    QuizCarouselPom.selectNewImage();
    QuizCarouselPom.editDescription('testDescription');
    QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY);
    DirectoryPom.OpenScheduleTable();
    ScheduleTablePom.SearchForWord(firstCard.word);
    ScheduleTablePom.firstRow().find(`.${scheduleRowOpenWordButton}`);
    WordCardPom.countRecords();
    WordCardPom.recognitionRecords();
    WordCardPom.description();
    WordCardPom.learningLanguage();
    WordCardPom.romanization();
    WordCardPom.translation();
    })
})