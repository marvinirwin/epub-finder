/// <reference types="cypress" />

import {DirectoryPom} from "../../support/pom/directory.pom";
import {READING_NODE} from "@shared/*";
import {ReadingPom} from "../../support/pom/reading.pom";
import {TestDocumentsPom} from "./test-documents.pom";

describe('Using the document id from the url', () => {
    it('Uses the document id from the url', () => {
        DirectoryPom.visitPage(READING_NODE);
        DirectoryPom.SelectDocumentToRead(TestDocumentsPom.htmlDocument.name);
        ReadingPom.TextIncludes(TestDocumentsPom.htmlDocument.firstLine);
        cy.reload();
        ReadingPom.TextIncludes(TestDocumentsPom.htmlDocument.firstLine);
    })
})


