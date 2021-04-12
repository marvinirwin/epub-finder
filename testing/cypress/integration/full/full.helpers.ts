import { selectReadingLanguage } from '../language.helpers'
import { setUploadName, setUploadText, uploadText } from '../upload.helpers'
import { QuizCarouselPom } from '../quiz/quiz-carousel.pom'
import { finished, learning, toReview, wordsLeft } from '../quiz-stats.helpers'
import { introNextButton } from '@shared/*'

export const selectChinese = () => {
    selectReadingLanguage('zh-Hans')
}

export const putTextDocument = (text: string, title: string) => {
    setUploadName(title)
    setUploadText(text);
    uploadText()
}

export const completeQuizCard = (word: string) => {
    // Click reveal and then select 5
    QuizCarouselPom.reveal().click()
    // Assert the word is what we expect
    QuizCarouselPom.learningLanguageTextShouldBe(word)
    QuizCarouselPom.easy().click();
}

export const expectTodaysStatsToBe = (
    config: { wordsLeft: number, learning: number, toReview: number, finished: number },
) => {
    wordsLeft().should('have.text', config.wordsLeft)
    learning().should('have.text', config.learning)
    toReview().should('have.text', config.toReview)
    finished().should('have.text', config.finished)
}

export const expectStats = (wordsLeft: number, learning: number, toReview: number, finished: number) => expectTodaysStatsToBe({
    wordsLeft,
    learning,
    toReview,
    finished
})

export const pressIntroNext = () => {
    cy.get(`#${introNextButton}`).click({force: true})
}

export const startOnBlankHappyPath = () => {
    cy.visitHome()
    cy.clearIndexedDB()
    cy.clearLocalStorage()
    cy.visitHome()
    selectChinese()
    pressIntroNext()
    putTextDocument('中国', '中国')
}

export const completeExpectedWord = (expectedWords: string[]) => {
    completeQuizCard(expectedWords.shift())
}
