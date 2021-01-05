import {documentSelectionRow, fileChooser} from "../constants";
import {DirectoryPom} from "../../support/pom/directory.pom";

describe('File Uploading', () => {
    beforeEach(() => {
        cy.visitHome()
    })
    /*
        it('Uploads docx', () => {
            cy.get(fileChooser).attachFile('test_docx.docx');
            DirectoryPom.EnterLibrary();
            cy.contains(documentSelectionRow, 'test_docx')
        })
    */
    it('Uploads pdf', () => {
        cy.get(fileChooser).attachFile('test_pdf.pdf');
        cy.contains(documentSelectionRow, 'test_pdf')
    })
    /*
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