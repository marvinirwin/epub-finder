/// <reference types="cypress" />
import {CardList} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";
import {ImageSearchPom} from "./image-search.pom";
import {HiddenQuizFields} from "../../../../server/src/shared/hidden-quiz-fields";
import {manualQuizHiddenFieldConfigId} from "@shared/*";

const CurrentQuizCard = '#current-quiz-card';


const defaultHotkeys = {
    quizScore5: '5',
    quizScore4: '4',
    quizScore3: '3',
    quizScore2: '2',
    quizScore1: '1',
}


class QuizCarouselPom {
    static goToQuizCard(word: string) {
        // Probably some sort of while loop with promises
    }

    body() {
        return cy.get(this.id);
    }

    img() {
        cy.find('img')
    }

    easy() {
        return cy.find('.quiz-button-easy')
    }

    medium() {
        return cy.find('.quiz-button-medium')
    }

    hard() {
        return cy.find('.quiz-button-hard')
    }

    hide() {
        return cy.find('.quiz-button-hide')
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

    editDescription(newDescription: string) {
        cy
            .find('.known-language')
            .type(newDescription);
    }

    selectNewImage() {
        // HACK, I just don't want to verify what src there is not, I'm just happy if it's not empty
        const oldSrc = '';
        ImageSearchPom.SelectFirstSearchResult();
        // Now assert we have an image we clicked (Or since I'm lazy, just not the previous one
        cy
            .find('.image')
            .should('have.attr', 'src').should('not.include', oldSrc);
    }

    static setHiddenFields(hiddenDefinition: string) {
        cy.get(`#${manualQuizHiddenFieldConfigId}`).type(hiddenDefinition)
    }
}


describe('Quiz Cards', () => {
    beforeEach(() => {
    })
    it('Shows the correct card body', () => {
        const firstCard = CardList[0];
        DirectoryPom.goToQuiz();
        QuizCarouselPom.setHiddenFields('hiddenDefinition');
        // Assert the definition and description are hidden
        QuizCarouselPom.definitionTextShouldBe('')
        QuizCarouselPom.descriptionTextShouldBe('')

        QuizCarouselPom.setHiddenFields('hiddenLearningLanguage');
        // Assert learning language empty
        QuizCarouselPom.learningLanguageTextShouldBe('');

        // Now reveal the while card
        QuizCarouselPom.reveal();
        QuizCarouselPom.definitionTextShouldBe(firstCard.description);
        QuizCarouselPom.editDescription('test');
        QuizCarouselPom.descriptionTextShouldBe(firstCard.description);
        QuizCarouselPom.learningLanguageTextShouldBe(firstCard.characters);
        QuizCarouselPom.selectNewImage();
        QuizCarouselPom.image().should('not.be.empty')
        DirectoryPom.pressHotkey(defaultHotkeys.quizScore5);
        // Assert the word is different
        // Now how do we get back to the original quiz card?
        QuizCarouselPom.learningLanguageTextShouldBe('');
        QuizCarouselPom.goToQuizCard(firstCard.characters);
    });
})


