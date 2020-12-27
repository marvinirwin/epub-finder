import {documentSelectionRow, fileChooser} from "../constants";

export function UploadLearningDocument() {
    cy.get(fileChooser).attachFile('test_quiz.html');
    cy.contains(documentSelectionRow, 'test_quiz')
        .should('have.class.reading');
}

interface QuizCardData {
    characters: string;
    image?: string;
    description?: string;
}

export const CardList: QuizCardData[] = [
    // Let's start with one card
    {
        characters: '的',
    },
    {
        characters: '一',
    },
    {
        characters: '是',
    }
];