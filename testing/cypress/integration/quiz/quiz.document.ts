import {DirectoryPom} from "../../support/pom/directory.pom";
import {documentSelectionRow, fileChooser} from "@shared/*";

export function UploadLearningDocument() {
    cy.get(`#${fileChooser}`).attachFile('test_quiz.html');
    DirectoryPom.OpenLibraryDialog()
    cy.get(`${documentSelectionRow}.reading`).contains('test_quiz')
    DirectoryPom.Back()
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