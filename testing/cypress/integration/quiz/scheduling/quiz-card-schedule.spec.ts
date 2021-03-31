import { DirectoryPom } from '../../../support/pom/directory.pom'
import { SettingsPom } from '../quiz-word-limit.spec'
import { libraryRowToggleFrequency } from '@shared/*'

const TestHtml3Sentences = {
    label: 'Test Html 3 Sentences',
}

export const SetFrequencyDocuments = (documentNames: string[]) => {
    DirectoryPom.OpenLibraryDialog()
    /**
     * Unselect all library dialog rows
     * Will I need to use inputProps
     */
    cy.get(`.${libraryRowToggleFrequency}`).uncheck()

    documentNames.forEach((documentName) => {
        cy.get(`#${documentName}`).find(`.${libraryRowToggleFrequency}`).check()
    })
}

const setDailyQuizWordLimit = (number: number) => {
    SettingsPom.SetNewQuizWordLimit(number)
}

function setFrequencyDocument(testHtml3Sentences: string) {
    SetFrequencyDocuments([testHtml3Sentences])
}

function assertQuizRowsInProgress(words: string[]) {
    DirectoryPom.OpenQuizScheduleOverview()
    assertQuizScheduleOverViewWords(words)
}

describe('Quiz card scheduling', () => {
    beforeEach(() => {
        cy.visitHome()
        cy.clearIndexedDB()
    })
    it('Starts with 0 records in progress when blank', () => {
        setDailyQuizWordLimit(3)
        setFrequencyDocument('Test Html 3 Sentences')
        assertQuizRowsInProgress([])
        closeAllDialogs()
        goToQuiz()
        assertQuizCardCharacter('你好')
        submitQuizResult(QuizResults.Easy)
        assertQuizCardCharacter('你')
        submitQuizResult(QuizResults.Easy)
        assertQuizCardCharacter('好')
        submitQuizResult(QuizResults.Easy)
        assertQuizRowsInProgress(['你好', '你', '好'])
        // Now it should be showing
        assertQuizCardCharacter('你好')
        submitQuizResult(QuizResults.Easy)
        assertQuizCardCharacter('你')
        submitQuizResult(QuizResults.Easy)
        assertQuizCardCharacter('好')
        submitQuizResult(QuizResults.Easy)
        // Now it should show me that we have no quiz results
        assertQuizRowsInProgress([])
        assertQuizRowsFinished(['你好', '你', '好'])
        assertLimitReached()
    })
})
