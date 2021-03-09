/// <reference types="cypress" />
import {CardList} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";
import {ImageSearchPom} from "./image-search.pom";
import {quizButtonReveal} from "@shared/*";
import { QuizCarouselPom } from "./quiz-carousel.pom";



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
        cy.visitHome();
        const firstCard = CardList[0];
        DirectoryPom.OpenQuiz();
        DirectoryPom.SetHiddenFields('hiddenDefinition');
        // Assert the definition and description are hidden
        QuizCarouselPom.translatedTextShouldBe('')
        QuizCarouselPom.descriptionTextShouldBe('')

        DirectoryPom.SetHiddenFields('hiddenLearningLanguage');
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
