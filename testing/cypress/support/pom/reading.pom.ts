import {annotatedAndTranslated} from "@shared/";

export class ReadingPom {
    public static frame() {
        return cy.get('#reading-document')
            .iframeBody()
    }

    public static TextIncludes(t: string) {
        cy.wait(500);
        ReadingPom.frame().contains(t)
    }

    public static RenderedSegments() {
        return ReadingPom
            .frame()
            .find(`.${annotatedAndTranslated}`)
    }

    public static Marks() {
        return ReadingPom.RenderedSegments()
            .find('mark')
    }
}