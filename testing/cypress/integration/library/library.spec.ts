import {DirectoryPom} from "../../support/pom/directory.pom";
import {
    libraryRow,
    libraryRowDelete,
    libraryRowToggleFrequency,
    libraryRowToggleReading,
    uploadTextArea,
    uploadTextButton,
    uploadTextName
} from "@shared/*";
import {ReadingPom} from "../../support/pom/reading.pom";

class TestDocument {
    constructor(private name: string, private text: string) {
    }
    upload() {
        DirectoryPom.OpenUploadDialog()
        // Maybe I should clear these?
        cy.get(`#${uploadTextName}`).type(this.name);
        cy.get(`#${uploadTextArea}`).type(this.text);
        cy.get(`#${uploadTextButton}`).click()
    }
    toggleReading() {
        DirectoryPom.OpenLibraryDialog();
        this.libraryRow().find(`.${libraryRowToggleReading}`).click();
        DirectoryPom.CloseAllDialogs();
    }

    private libraryRow() {
        return cy.get(`#${this.name}.${libraryRow}`);
    }

    assertIsUsedForReading() {
        cy.wait(1000);
        ReadingPom.TextIncludes(this.text);
    }

    assertIsNotUsedForReading() {
        cy.wait(1000);
        ReadingPom.RenderedSegments().should('not.include', this.text);
    }

    toggleFrequency() {
        DirectoryPom.OpenLibraryDialog();
        this.libraryRow().find(`.${libraryRowToggleFrequency}`).click();
        DirectoryPom.CloseAllDialogs();
    }

    assertIsUsedForFrequency() {
        // How do I do this?
        // Quiz example sentences?
    }

    assertIsNotUsedForFrequency() {

    }

    delete() {
        DirectoryPom.OpenLibraryDialog();
        this.libraryRow().find(`.${libraryRowDelete}`).click();
        DirectoryPom.CloseAllDialogs();
    }

    assertIsDeleted() {
        this.libraryRow().should('not.exist');
    }
}

describe( 'The library popup', () => {
        it('Can delete documents', () => {
            cy.visitHome()
            const testDocument = new TestDocument('test', 'test')
            testDocument.upload();
            testDocument.toggleReading();
            testDocument.assertIsUsedForReading();
            testDocument.toggleReading();
            testDocument.assertIsNotUsedForReading();
            testDocument.toggleFrequency();
            testDocument.assertIsUsedForFrequency()
            testDocument.toggleFrequency()
            testDocument.assertIsNotUsedForFrequency()
            testDocument.delete();
            testDocument.assertIsDeleted();
        })
    }
)