import { uploadTextArea, uploadTextButton, uploadTextName } from '@shared/*'

export const setUploadName = (str: string) => {
    cy.get(`#${uploadTextName}`).type(str)
}
export const setUploadText = (str: string) => {
    cy.get(`#${uploadTextArea}`).type(str)
}
export const uploadText = () => {
    cy.get(`#${uploadTextButton}`).click()
}
