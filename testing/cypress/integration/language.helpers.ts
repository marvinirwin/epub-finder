import { introLanguageSelect, readingLanguageSelect, spokenLanguageSelect } from '@shared/*'

export const expectIntroLanguageSelect = () => {
    cy.get(`#${introLanguageSelect}`).should('exist')
}

export const selectReadingLanguage = (langCode: string) => {
    cy.get(`.${readingLanguageSelect}`).select(langCode)
}
export const selectSpokenLanguage = (langCode: string) => {
    cy.get(`.${spokenLanguageSelect}`).select(langCode)
}
