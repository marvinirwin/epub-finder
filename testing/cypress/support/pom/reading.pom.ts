/// <reference types="cypress" />
import {annotatedAndTranslated} from '@shared/*'

export class ReadingPom {
    public static Frame() {
        return cy.get('#reading-document')
            .iframeBody()
    }

    public static TextIncludes(t: string) {
        cy.wait(500);
        ReadingPom.Frame().contains(t)
    }

    public static RenderedSegments() {
        return ReadingPom
            .Frame()
            .find(`.${annotatedAndTranslated}`)
    }

    public static Marks() {
        return ReadingPom.RenderedSegments()
            .find('mark')
    }
}