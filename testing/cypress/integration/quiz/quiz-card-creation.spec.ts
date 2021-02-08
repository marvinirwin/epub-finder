import {DirectoryPom} from "../../support/pom/directory.pom";
import {READING_NODE} from "@shared/*";
import {ReadingPom} from "../../support/pom/reading.pom";
import {TestDocumentsPom} from "../reading/test-documents.pom";

describe('quiz card creation', () => {
    it('Does not create cards which are not from the language being studied', () => {
        DirectoryPom.visitPage(READING_NODE);
        ReadingPom.TextIncludes(TestDocumentsPom.defaultDocument.firstLine);
    })
})