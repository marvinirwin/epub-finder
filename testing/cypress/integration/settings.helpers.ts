import { DirectoryPom } from '../support/pom/directory.pom'
import { newWordLimitInput } from '@shared/*'

export const setNewQuizWordLimit = (newLimit: number) => {
    DirectoryPom.OpenSettings()
    const limitInputSelector = `#${newWordLimitInput}`
    cy.get(limitInputSelector).invoke('val', '0')
    cy.get(limitInputSelector).click().clear().type(`${newLimit}`)
    DirectoryPom.CloseAllDialogs()
}