import {fileChooser} from "../constants";

describe('Quiz ordering', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/?test=1&skip_intro=1')
            .signupLogin()
            .get(fileChooser).should('not.be.disabled');
    })
    it('TODO', () => {

        // Now test all transitions
        // Test the hide part
        // Test easy/medium/hard and test their influence on the table page

        // Oh and test a daily goal thing
    })
    /*
        it('Uploads docx', () => {
            cy.get(fileChooser).attachFile('test_docx.docx');
            cy.contains(documentSelectionRow, 'test_docx')
        })
    */
    /*
        it('Uploads text', () => {
            cy.get(fileChooser).attachFile('test_txt.txt');
            cy.contains(documentSelectionRow, 'test_txt')
        })
        it('Uploads html', () => {
            cy.get(fileChooser).attachFile('test_html.html');
            cy.contains(documentSelectionRow, 'test_html')
        })
    */
})