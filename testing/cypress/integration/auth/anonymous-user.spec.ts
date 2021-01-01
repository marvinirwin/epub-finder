import {documentSelectionRow, fileChooser} from "../constants";
import {DirectoryPom} from "../../support/pom/directory.pom";

describe('Anonymous users', () => {
    beforeEach(() => {
            cy.visitHome();
    })
    it('Links the document uploaded by an anonymous user to the same user when they sign up after in the same session', () => {
        cy.get(fileChooser).attachFile('test_txt.txt');
        DirectoryPom.EnterLibrary();
        cy.contains(documentSelectionRow, 'test_txt');
        DirectoryPom.Back();
        cy.signup();
        DirectoryPom.EnterLibrary();
        cy.contains(documentSelectionRow, 'test_txt');
    })
    /*
        it('Uploads pdf', () => {
            cy.get(fileChooser).attachFile('test_pdf.pdf');
            cy.contains(documentSelectionRow, 'test_pdf')
        })
        it('Uploads html', () => {
            cy.get(fileChooser).attachFile('test_html.html');
            cy.contains(documentSelectionRow, 'test_html')
        })
    it('Uploads text', () => {
        cy.get(fileChooser).attachFile('test_txt.txt');
        cy.contains(documentSelectionRow, 'test_txt')
    })
    */
})
