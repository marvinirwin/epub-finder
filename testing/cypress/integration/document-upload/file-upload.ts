/// <reference types="cypress" />
const documentSelectionRow = '.document-selection-row';
const fileChooser = '#file-chooser';
describe('File Uploading', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/?test=1')
            .signupLogin()
            .skipIntro()
            .get(fileChooser).should('not.be.disabled');
    })
    it('Uploads pdf', () => {
        cy.get(fileChooser).attachFile('test_pdf.pdf');
        cy.contains(documentSelectionRow, 'test_pdf')
    })
    it('Uploads docx', () => {
        cy.get(fileChooser).attachFile('test_docx.docx');
        cy.contains(documentSelectionRow, 'test_docx')
    })
    it('Uploads text', () => {
        cy.get(fileChooser).attachFile('test_txt.txt');
        cy.contains(documentSelectionRow, 'test_txt')
    })
    it('Uploads html', () => {
        cy.get(fileChooser).attachFile('test_html.html');
        cy.contains(documentSelectionRow, 'test_html')
    })
})