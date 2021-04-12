import { assertOutOfWords, QuizCarouselPom } from '../quiz/quiz-carousel.pom'
import { setNewQuizWordLimit } from '../settings.helpers'
import { completeExpectedWord, expectStats, startOnBlankHappyPath } from './full.helpers'


describe('Normal functioning of the app', () => {

    it('Functions in the happy path', () => {
        startOnBlankHappyPath()
        setNewQuizWordLimit(10);
        const expectedWords = [
            '中国',
            '中',
            '国',

            '中国',
            '中',
            '国',

            '中国',
            '中',
            '国',

            '中国',
            '中',
            '国',
        ]
        completeExpectedWord(expectedWords)
        // Expect 0 finished, 1 in progress and 2 left
        expectStats(2, 1, 0, 0)
        completeExpectedWord(expectedWords)
        expectStats(1, 2, 0, 0)
        completeExpectedWord(expectedWords)
        expectStats(0, 3, 0, 0)

        // We have to compete each card thrice
        completeExpectedWord(expectedWords)
        expectStats(0, 3, 0, 0)
        completeExpectedWord(expectedWords)
        expectStats(0, 3, 0, 0)
        completeExpectedWord(expectedWords)
        expectStats(0, 3, 0, 0)

        completeExpectedWord(expectedWords)
        expectStats(0, 3, 0, 0)
        completeExpectedWord(expectedWords)
        expectStats(0, 3, 0, 0)
        completeExpectedWord(expectedWords)
        expectStats(0, 3, 0, 0)

        completeExpectedWord(expectedWords)
        expectStats(0, 2, 0, 1)
        completeExpectedWord(expectedWords)
        expectStats(0, 1, 0, 2)
        completeExpectedWord(expectedWords)
        assertOutOfWords()
    })
})