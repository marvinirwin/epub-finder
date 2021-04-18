import {
    introLanguageSelect,
    readingLanguageSelect,
    spokenLanguageSelect,
} from '@shared/*'


function expectIntroLearningMaterial() {}

describe('The introduction', () => {
    beforeEach(() => {
        cy.clearIndexedDB()
        cy.clearLocalStorage()
    })
    it('Shows the introduction of its the users first time', () => {
        cy.visitHome()
        expectIntroLanguageSelect()
        selectReadingLanguage('zh-Hans')
        selectSpokenLanguage('zh-han')
        expectIntroLearningMaterial()
        enterLearningMaterial('好', '好')
        expectIntroHidden()
    })
})
