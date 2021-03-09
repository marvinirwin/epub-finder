import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCarouselPom} from "./quiz-carousel.pom";
import {QUIZ_BUTTON_EASY} from "@shared/*";

describe('A card containing all information about a word', () => {
    it('Contains all expected fields', () => {
        cy.visitHome();
    DirectoryPom.OpenQuiz();
    QuizCarouselPom.reveal();
    QuizCarouselPom.selectNewImage();
    QuizCarouselPom.editDescription('testDescription');
    QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY);
    DirectoryPom.OpenScheduleTable();
    ScheduleTablePom.SearchForWord(firdtQuizRecord.word);
    ScheduleTablePom.clickFirstRow();
    WordCardPom.countRecords();
    WordCardPom.recognitionRecords();
    WordCardPom.description();
    WordCardPom.learningLanguage();
    WordCardPom.learningLanguage();
    WordCardPom.learningLanguage();

    })
})