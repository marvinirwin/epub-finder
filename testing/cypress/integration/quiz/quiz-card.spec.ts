/// <reference types="cypress" />
import {CardList} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";
import {ImageSearchPom} from "./image-search.pom";
import {quizButtonReveal} from "@shared/*";
import { QuizCarouselPom } from "./quiz-carousel.pom";

const CurrentQuizCard = '#current-quiz-card';


const defaultHotkeys = {
    quizScore5: '5',
    quizScore4: '4',
    quizScore3: '3',
    quizScore2: '2',
    quizScore1: '1',
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
        DirectoryPom.PressHotkey(defaultHotkeys.quizScore5);
        // Assert the word is different
        // Now how do we get back to the original quiz card?
        QuizCarouselPom.learningLanguageTextShouldBe('');
        QuizCarouselPom.goToQuizCard(firstCard.characters);
    });
})


describe('Quiz Cards', () => {
    beforeEach(() => {
    })
    it('Shows the correct card body', () => {
        cy.visitHome();
        const firstCard = CardList[0];
        DirectoryPom.goToQuiz();
        QuizCarouselPom.setHiddenFields('hiddenDefinition');
        // Assert the definition and description are hidden
        QuizCarouselPom.translatedTextShouldBe('')
        QuizCarouselPom.descriptionTextShouldBe('')

        QuizCarouselPom.setHiddenFields('hiddenLearningLanguage');
        // Assert learning language empty
        QuizCarouselPom.learningLanguageTextShouldBe('');

        // Now reveal the while card
        QuizCarouselPom.reveal();
        QuizCarouselPom.translatedTextShouldBe(firstCard.description);
        QuizCarouselPom.editDescription('test');
        QuizCarouselPom.descriptionTextShouldBe(firstCard.description);
        QuizCarouselPom.learningLanguageTextShouldBe(firstCard.characters);
        QuizCarouselPom.selectNewImage();
        DirectoryPom.PressHotkey(defaultHotkeys.quizScore5);
    });
})
