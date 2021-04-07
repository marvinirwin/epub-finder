import { quizLearnedTodayNumber, quizLearningNumber, quizToReviewNumber, quizWordsLeftForTodayNumber } from '@shared/*'

export const wordsLeft = () => cy.get(`.${quizWordsLeftForTodayNumber}`);
export const learning = () => cy.get(`.${quizLearningNumber}`);
export const toReview = () => cy.get(`.${quizToReviewNumber}`);
export const finished = () => cy.get(`.${quizLearnedTodayNumber}`)
