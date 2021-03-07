import {documentSelectionRow, fileChooser} from "../constants";
import {DirectoryPom} from "../../support/pom/directory.pom";

function uploadFile(fixture: string) {
    DirectoryPom.OpenUploadDialog();
    cy.get(fileChooser).attachFile(fixture);
    DirectoryPom.CloseAllDialogs();
    cy.get('#global-loading-spinner').should('be.visible');
    cy.get('#global-loading-spinner').should('not.be.visible');
}

describe('Anonymous users', () => {
    beforeEach(() => {
        cy.visitHome();
    })
    it('Links the document uploaded by an anonymous user to the same user when they sign up after in the same session', () => {
        const selectionRow = () => cy.contains(documentSelectionRow, 'test_txt');
        uploadFile('test_txt.txt');
        DirectoryPom.OpenLibraryDialog();
        selectionRow().should('exist');
        DirectoryPom.Back();
        cy.signup().then(credentials => {
            DirectoryPom.OpenLibraryDialog();
            selectionRow().should('exist');
            DirectoryPom.Back()
            DirectoryPom.signout();
            selectionRow().should('not.exist');
            // I should be able to sign in with the same credentials
            cy.login(credentials);
            selectionRow().should('exist');
        });
    })
})
