import {
    introLanguageSelect,
    readingLanguageSelect,
    readingLanguageSelectOption,
    spokenLanguageSelect,
} from '@shared/*'

export const expectIntroLanguageSelect = () => {
    cy.get(`#${introLanguageSelect}`).should('exist')
}

export const selectReadingLanguage = (langCode: string) => {
    cy.get(`.${readingLanguageSelect}`).click();
    cy.get(`.${readingLanguageSelectOption}[data-value="${langCode}"]`).click({force: true})
}
export const selectSpokenLanguage = (langCode: string) => {
    cy.get(`.${spokenLanguageSelect}`).select(langCode)
}
