import {
    introLanguageSelect,
    readingLanguageSelect,
    spokenLanguageSelect,
} from '@shared/*'

const expectIntroLanguageSelect = () => {
    cy.get(`#${introLanguageSelect}`).should('exist')
}

const selectReadingLanguage = (langCode: string) => {
    cy.get(`.${readingLanguageSelect}`).select(langCode)
}
const selectSpokenLanguage = (langCode: string) => {
    cy.get(`.${spokenLanguageSelect}`).select(langCode)
}

function expectIntroLearningMaterial() {}

describe('The introduction', () => {
    beforeEach(() => {
        cy.clearIndexedDB()
        cy.clearLocalStorage()
    })
    it('Shows the introduction of its the users first time', () => {
        cy.visitHome()
        expectIntroLanguageSelect()
        selectReadingLanguage('zh-hans')
        selectSpokenLanguage('zh-han')
        expectIntroLearningMaterial()
        enterLearningMaterial('好', '好')
        expectIntroHidden()
    })
})
