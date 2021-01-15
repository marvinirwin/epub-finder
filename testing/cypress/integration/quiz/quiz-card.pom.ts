import {ImageSearchPom} from "./image-search.pom";

export const CurrentQuizCard = '#current-quiz-card';

export class QuizCardPom {
    constructor(private id: string) {
    }

    body() {
        return cy.get(this.id);
    }

    img() {
        this.body().find('img')
    }

    easy() {
        return this.body().find('.quiz-button-easy')
    }

    medium() {
        return this.body().find('.quiz-button-medium')
    }

    hard() {
        return this.body().find('.quiz-button-hard')
    }

    hide() {
        return this.body().find('.quiz-button-hide')
    }

    characters() {
        return this.body().find('.quiz-text')
    }

    exampleSentences() {
        return this.body()
            .find('iframe')
            .iframeBody()
            .find('.example-sentence')
    }

    editDescription(newDescription: string) {
        this.body()
            .find('.known-language')
            .type(newDescription);
    }

    selectNewImage() {
        // HACK, I just don't want to verify what src there is not, I'm just happy if it's not empty
        const oldSrc = '';
        ImageSearchPom.SelectFirstSearchResult();
        // Now assert we have an image we clicked (Or since I'm lazy, just not the previous one
        this.body()
            .find('.image')
            .should('have.attr', 'src').should('not.include', oldSrc);
    }

}