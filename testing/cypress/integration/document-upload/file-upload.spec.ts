import {documentSelectionRow, fileChooser} from "../constants";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {loadingBackdropTypography} from '@shared/*';

function testUpload(fixture: string, testDocx: string) {
    cy.get(fileChooser).attachFile(fixture);
    cy.contains(loadingBackdropTypography, testDocx);
    DirectoryPom.EnterLibrary();
    cy.contains(documentSelectionRow, testDocx);
}

describe('File Uploading', () => {
    beforeEach(() => {
        cy.visitHome();
        DirectoryPom.closeAllDialogs();
        DirectoryPom.openUploadDialog();
    })
    it('Uploads docx', () => {
        testUpload('test_docx.docx', 'test_docx');
    })
    it('Uploads pdf', () => {
        testUpload('test_pdf.pdf', 'test_pdf');
    })
    it('Uploads html', () => {
        testUpload('test_html.html', 'test_html');
    })
    it('Uploads text', () => {
        testUpload('test_txt.txt', 'test_txt');
    })
})