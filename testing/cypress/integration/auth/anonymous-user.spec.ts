import {documentSelectionRow, fileChooser} from "../constants";
import {DirectoryPom} from "../../support/pom/directory.pom";

describe('Anonymous users', () => {
    beforeEach(() => {
        cy.visitHome();
    })
    it('Links the document uploaded by an anonymous user to the same user when they sign up after in the same session', () => {
        const selectionRow = () => cy.contains(documentSelectionRow, 'test_txt');
        DirectoryPom.openUploadDialog();
        cy.get(fileChooser).attachFile('test_txt.txt');
        cy.get('#loading-backdrop').should('not.be.visible');
        DirectoryPom.closeAllDialogs();
        DirectoryPom.EnterLibrary();
        selectionRow().should('exist');
        DirectoryPom.Back();
        cy.signup().then(credentials => {
            DirectoryPom.EnterLibrary();
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
