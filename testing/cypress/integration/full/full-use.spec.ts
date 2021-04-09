import { selectReadingLanguage } from '../language.helpers'
import { setUploadName, setUploadText, uploadText } from '../upload.helpers'
import { QuizCarouselPom } from '../quiz/quiz-carousel.pom'
import { finished, learning, toReview, wordsLeft } from '../quiz-stats.helpers'
import { introNextButton } from '@shared/*'
import { setNewQuizWordLimit } from '../settings.helpers'

function selectChinese() {
    selectReadingLanguage('zh-Hans')
}



function putTextDocument(text: string, title: string) {
    setUploadName(title)
    setUploadText(text);
    uploadText()
}

export const completeQuizCard = (word: string) => {
    // Click reveal and then select 5
    QuizCarouselPom.reveal().click()
    // Assert the word is what we expect
    QuizCarouselPom.learningLanguageTextShouldBe(word)
    QuizCarouselPom.easy()
}

function expectTodaysStatsToBe(
    config: { wordsLeft: number, learning: number, toReview: number, finished: number },
) {
    wordsLeft().should('have.text', config.wordsLeft)
    learning().should('have.text', config.learning)
    toReview().should('have.text', config.toReview)
    finished().should('have.text', config.finished)
}

function expectStats(wordsLeft: number, learning: number, toReview: number, finished: number) {
    return expectTodaysStatsToBe({ wordsLeft, learning, toReview, finished })
}

const pressIntroNext = () => {
    cy.get(`#${introNextButton}`).click({force: true})
}

describe('Normal functioning of the app', () => {
    function completeExpectedWord(expectedWords: string[]) {
        completeQuizCard(expectedWords.shift())
    }

    it('Functions in the happy path', () => {
        cy.clearIndexedDB()
        cy.clearLocalStorage()
        cy.visitHome();
        selectChinese()
        pressIntroNext();
        putTextDocument('test', '你好');
        setNewQuizWordLimit(10);
        const expectedWords = [
            '你好',
            '你',
            '好',

            '你好',
            '你',
            '好',

            '你好',
            '你',
            '好',
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
        expectStats(0, 2, 0, 1)
        completeExpectedWord(expectedWords)
        expectStats(0, 1, 0, 2)
        completeExpectedWord(expectedWords)
        expectStats(0, 0, 0, 3)

        QuizCarouselPom.assertCardLimitReached()
        setNewQuizWordLimit(10)
        QuizCarouselPom.assertOutOfWords()
    })
})