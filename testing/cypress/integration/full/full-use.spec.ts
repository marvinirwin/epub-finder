import { selectReadingLanguage } from '../language.helpers'
import { setUploadName, setUploadText } from '../upload.helpers'
import { QuizCarouselPom } from '../quiz/quiz-carousel.pom'
import { finished, learning, toReview, wordsLeft } from '../quiz-stats.helpers'
import { SettingsPom } from '../quiz/quiz-word-limit.spec'

function selectChinese() {
    selectReadingLanguage('zh-hans')
}

function putTextDocument(text: string, title: string) {
    setUploadName(title)
    setUploadText(text)
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

describe('Normal functioning of the app', () => {
    function completeExpectedWord(expectedWords: string[]) {
        completeQuizCard(expectedWords.shift())
    }

    it('', () => {
        selectChinese()
        putTextDocument('test', '你好')
        // setGoal(10);
        // SubmitQuizResults({word: '你好', type: })
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
        SettingsPom.SetNewQuizWordLimit(10)
        QuizCarouselPom.assertOutOfWords()
    })
})