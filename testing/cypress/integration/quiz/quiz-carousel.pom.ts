/// <reference types="cypress" />
import { ImageSearchPom } from './image-search.pom'
import {
    frequencyDocumentProgressPrefix,
    cardLimitReached,
    QUIZ_BUTTON_EASY,
    QUIZ_BUTTON_HARD,
    QUIZ_BUTTON_IGNORE,
    QUIZ_BUTTON_MEDIUM,
    quizButtonReveal,
    quizCardDescription,
    quizCardImage,
    quizCardLearningLanguage,
    quizCardTranslation,
    quizLearningNumber,
    quizToReviewNumber,
    quizWordsLeftForTodayNumber,
    recognizedCount,
    somewhatRecognizedCount,
    unrecognizedCount, outOfWords,
} from '@shared/*'
import { wordsLeft } from '../quiz-stats.helpers'

export const defaultHotkeys = {
    quizScore5: '5',
    quizScore4: '4',
    quizScore3: '3',
    quizScore2: '2',
    quizScore1: '1',
}

type RecognizedCounts = {
    recognizedCount: number
    somewhatRecognizedCount: number
    unrecognizedCount: number
}

export const assertOutOfWords = () => cy.get(`.${outOfWords}`).should('exist')

export class QuizCarouselPom {
    static goToQuizCard(word: string) {
        // Probably some sort of while loop with promises
    }

    img() {
        return cy.get(`#${quizCardImage}`)
    }

    static easy() {
        return cy.get(`.${QUIZ_BUTTON_EASY}`)
    }

    static medium() {
        return cy.get(`.${QUIZ_BUTTON_MEDIUM}`)
    }

    static hard() {
        return cy.get(`.${QUIZ_BUTTON_HARD}`)
    }

    static hide() {
        return cy.get(`.${QUIZ_BUTTON_IGNORE}`)
    }

    static characters() {
        return cy.get('.quiz-text')
    }

    static exampleSentences() {
        return cy.get('iframe').iframeBody().find('.example-sentence')
    }

    static editDescription(newDescription: string) {
        cy.get(`.${quizCardDescription}`).type(newDescription)
    }

    static selectNewImage() {
        // HACK, I just don't want to verify what src there is not, I'm just happy if it's not empty
        const oldSrc = ''
        ImageSearchPom.SelectFirstSearchResult()
        // Now assert we have an image we clicked (Or since I'm lazy, just not the previous one
        cy.get(`.${quizCardImage}`)
            .should('have.attr', 'src')
            .should('not.include', oldSrc)
    }

    static translatedTextShouldBe(s: string) {
        cy.get(`.${quizCardTranslation}`).should('have.text', s)
    }

    static descriptionTextShouldBe(s: string) {
        cy.get(`.${quizCardDescription}`).should('have.text', s)
    }

    static learningLanguageTextShouldBe(s: string) {
        cy.get(`.${quizCardLearningLanguage}`).should('have.text', s)
    }

    static reveal() {
        return cy.get(`#${quizButtonReveal}`)
    }

    static assertCardLimitReached() {
        cy.get(`.${cardLimitReached}`).should('be.visible')
    }
    static assertOutOfWords() {
        cy.get(`.${outOfWords}`).should('be.visible');
    }

    static submitQuizResult(
        difficulty:
            | typeof QUIZ_BUTTON_HARD
            | typeof QUIZ_BUTTON_MEDIUM
            | typeof QUIZ_BUTTON_EASY
            | typeof QUIZ_BUTTON_IGNORE,
    ) {
        cy.get(`.${difficulty}`).click()
    }

    static frequencyDocumentProgressContainer(documentName: string) {
        return cy.get(`${frequencyDocumentProgressPrefix}${documentName}`)
    }

    static assertFrequencyDocumentProgress(
        documentName: string,
        counts: RecognizedCounts,
    ) {
        const assertCount = (selector: string, count: number) => {
            QuizCarouselPom.frequencyDocumentProgressContainer(documentName)
                .find(`.${selector}`)
                .should('contain', count)
        }

        assertCount(recognizedCount, counts.recognizedCount)
        assertCount(unrecognizedCount, counts.unrecognizedCount)
        assertCount(somewhatRecognizedCount, counts.somewhatRecognizedCount)
    }

    static learningNumber() {
        return cy.get(`.${quizLearningNumber}`)
    }

    static toReviewNumber() {
        return cy.get(`.${quizToReviewNumber}`)
    }

    static unLearned() {
        return cy.get(`.${quizWordsLeftForTodayNumber}`)
    }

    static leftToday() {
        return wordsLeft()
    }
}
