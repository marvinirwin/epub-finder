import { setNewQuizWordLimit } from '../settings.helpers'
import { completeExpectedWord, expectStats, startOnBlankHappyPath } from './full.helpers'


it('Limits words correctly', () => {
    startOnBlankHappyPath()
    setNewQuizWordLimit(1);
    const expectedWords = [
        '中国',
        '中国',
        '中国',
        '中国',
    ];
    expectStats(1, 0, 0, 0);
    cy.wait(500);
    completeExpectedWord(expectedWords);
    cy.wait(500);
    expectStats(0, 1, 0, 0);
    cy.wait(500);
    completeExpectedWord(expectedWords);
    cy.wait(500);
    expectStats(0, 1, 0, 0);
    cy.wait(500);
    completeExpectedWord(expectedWords);
    cy.wait(500);
    completeExpectedWord(expectedWords);
})
