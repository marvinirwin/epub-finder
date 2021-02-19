import {
    frequencyDocumentProgressPrefix,
    QUIZ_BUTTON_EASY,
    QUIZ_BUTTON_HARD,
    QUIZ_BUTTON_IGNORE,
    QUIZ_BUTTON_MEDIUM, recognizedCount, somewhatRecognizedCount, unrecognizedCount
} from "@shared/*";

type RecognizedCounts = { recognizedCount: number, somewhatRecognizedCount: number, unrecognizedCount: number };

export class QuizPom {

    static submitQuizResult(
        difficulty: typeof QUIZ_BUTTON_HARD |
            typeof QUIZ_BUTTON_MEDIUM |
            typeof QUIZ_BUTTON_EASY |
            typeof QUIZ_BUTTON_IGNORE
    ) {
        cy.get(`.${difficulty}`).click();
    }

    static frequencyDocumentProgressContainer(documentName: string) {
        return cy.get(`${frequencyDocumentProgressPrefix}${documentName}`);
    }

    static assertFrequencyDocumentProgress(
        documentName: string,
        counts: RecognizedCounts
    ) {
        const assertCount = (selector: string,
                             count: number) => {
            QuizPom.frequencyDocumentProgressContainer(documentName)
                .find(`.${selector}`)
                .should('contain', count)
        };

        assertCount(recognizedCount, counts.recognizedCount);
        assertCount(unrecognizedCount, counts.unrecognizedCount);
        assertCount(somewhatRecognizedCount, counts.somewhatRecognizedCount);
    }
}