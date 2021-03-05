/// <reference types="cypress" />
import {CardList} from "./quiz.document";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizCardPom} from "./quiz-card.pom";

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

    }
}


describe('Quiz Cards', () => {
    beforeEach(() => {
    })
    it('Shows the correct card body', () => {
        DirectoryPom.goToQuiz();
        const card = new QuizCardPom(CurrentQuizCard);
        const firstCard = CardList[0];
        card.characters().should('contain', firstCard);
        card.editDescription('test');
        card.selectNewImage();
        DirectoryPom.pressHotkey(defaultHotkeys.quizScore5);
        // Assert the word is different
        // Now how do we get back to the original quiz card?
        QuizCarouselPom.goToQuizCard();

    });
})


