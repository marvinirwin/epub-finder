import {DirectoryPom} from "../../support/pom/directory.pom";
import {documentSelectionRow, fileChooser, loadingBackdropTypography, uploadProgressBar} from '@shared/*';

function testUpload(fixture: string, testDocx: string) {
    cy.get(`#${fileChooser}`).attachFile(`reading-documents/${fixture}`);
    cy.get(`.${uploadProgressBar}`).should('exist');
    cy.wait(10000)
    cy.get(`.${uploadProgressBar}`).should('not.exist');
    DirectoryPom.OpenLibraryDialog();
    cy.contains(`.${documentSelectionRow}`, testDocx);
}

describe('File Uploading', () => {
    beforeEach(() => {
        cy.visitHome();
        DirectoryPom.CloseAllDialogs();
        DirectoryPom.OpenUploadDialog();
    })
    it('Uploads pdf', () => {
        testUpload('test_pdf.pdf', 'test_pdf');
    })
    it('Uploads docx', () => {
        testUpload('test_docx.docx', 'test_docx');
    })
    it('Uploads html', () => {
        testUpload('test_html.html', 'test_html');
    })
    it('Uploads text', () => {
        testUpload('test_txt.txt', 'test_txt');
    })
})