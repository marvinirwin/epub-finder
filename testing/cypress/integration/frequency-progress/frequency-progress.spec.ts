import {QUIZ_BUTTON_EASY} from "@shared/*";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCarouselPom} from "../quiz/quiz-carousel.pom";

const defaultTestFrequencyDocument = 'Default Test Frequency Document';
const testFrequencyDocument1 = 'Test Frequency Document 1';

describe('Shows progress on frequency documents', () => {
    beforeEach(() => {
        cy.visitHome();
        cy.clearIndexedDB();
    })
    it('Selects the default frequency documents to use', () => {
        DirectoryPom.OpenQuiz();
        QuizCarouselPom.frequencyDocumentProgressContainer(defaultTestFrequencyDocument).should('exist');
    });
    it('Updates the progress reading that document when a quiz result is submitted', () => {
        DirectoryPom.OpenQuiz();
        QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY);
        QuizCarouselPom.assertFrequencyDocumentProgress(
            defaultTestFrequencyDocument,
            {
                somewhatRecognizedCount: 1,
                recognizedCount: 0,
                unrecognizedCount: 1
            }
        )
    });
    it('Shows the user their progress when they select the frequency documents they want', () => {
        DirectoryPom.OpenQuiz();
        DirectoryPom.SelectFrequencyDocuments(testFrequencyDocument1, 'Test Frequency Document 2');
        QuizCarouselPom.submitQuizResult(QUIZ_BUTTON_EASY);
        QuizCarouselPom.assertFrequencyDocumentProgress(
            testFrequencyDocument1,
            {
                somewhatRecognizedCount: 1,
                recognizedCount: 0,
                unrecognizedCount: 1
            }
        );
        QuizCarouselPom.assertFrequencyDocumentProgress(
            defaultTestFrequencyDocument,
            {
                somewhatRecognizedCount: 1,
                recognizedCount: 0,
                unrecognizedCount: 1
            }
        )
    })
})