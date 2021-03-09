/// <reference types="cypress" />
import {CardList} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";
import {ImageSearchPom} from "./image-search.pom";
import {HiddenQuizFields} from "../../../../reader/src/lib/hidden-quiz-fields";
import {
    frequencyDocumentProgressPrefix,
    manualQuizHiddenFieldConfigId,
    noMoreQuizCards,
    QUIZ_BUTTON_EASY,
    QUIZ_BUTTON_HARD,
    QUIZ_BUTTON_IGNORE,
    QUIZ_BUTTON_MEDIUM,
    quizButtonReveal,
    quizCardDescription,
    quizCardImage,
    quizCardLearningLanguage,
    quizCardTranslation,
    recognizedCount,
    somewhatRecognizedCount,
    unrecognizedCount
} from "@shared/*";


export const defaultHotkeys = {
    quizScore5: '5',
    quizScore4: '4',
    quizScore3: '3',
    quizScore2: '2',
    quizScore1: '1',
}

type RecognizedCounts = { recognizedCount: number, somewhatRecognizedCount: number, unrecognizedCount: number };


export class QuizCarouselPom {
    static goToQuizCard(word: string) {
        // Probably some sort of while loop with promises
    }

    img() {
        return cy.find(`#${quizCardImage}`)
    }

    easy() {
        return cy.find(`.${QUIZ_BUTTON_EASY}`)
    }

    medium() {
        return cy.find(`.${QUIZ_BUTTON_MEDIUM}`)
    }

    hard() {
        return cy.find(`.${QUIZ_BUTTON_HARD}`)
    }

    hide() {
        return cy.find(`.${QUIZ_BUTTON_IGNORE}`)
    }

    characters() {
        return cy.find('.quiz-text')
    }

    exampleSentences() {
        return cy
            .find('iframe')
            .iframeBody()
            .find('.example-sentence')
    }

    static editDescription(newDescription: string) {
        cy
            .find(`.${quizCardDescription}`)
            .type(newDescription);
    }

    static selectNewImage() {
        // HACK, I just don't want to verify what src there is not, I'm just happy if it's not empty
        const oldSrc = '';
        ImageSearchPom.SelectFirstSearchResult();
        // Now assert we have an image we clicked (Or since I'm lazy, just not the previous one
        cy
            .find(`.${quizCardImage}`)
            .should('have.attr', 'src').should('not.include', oldSrc);
    }


    static translatedTextShouldBe(s: string) {
        cy.get(`.${quizCardTranslation}`).should('have.text', s);
    }

    static descriptionTextShouldBe(s: string) {
        cy.get(`.${quizCardDescription}`).should('have.text', s)
    }

    static learningLanguageTextShouldBe(s: string) {
        cy.get(`.${quizCardLearningLanguage}`).should('have.text', s)
    }

    static reveal() {
        cy.get(`#${quizButtonReveal}`)
    }

    static assertNoQuizCard() {
        cy.get(`.${noMoreQuizCards}`).should('be.visible')
    }


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
            QuizCarouselPom.frequencyDocumentProgressContainer(documentName)
                .find(`.${selector}`)
                .should('contain', count)
        };

        assertCount(recognizedCount, counts.recognizedCount);
        assertCount(unrecognizedCount, counts.unrecognizedCount);
        assertCount(somewhatRecognizedCount, counts.somewhatRecognizedCount);
    }
}




