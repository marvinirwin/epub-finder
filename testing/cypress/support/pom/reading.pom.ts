export class ReadingPom {
    public static frame() {
        return cy.get('#reading-document')
            .iframeBody()
    }

    public static RenderedSegments() {
        return ReadingPom
            .frame()
            .find('.annotated_and_translated')
    }

    public static Marks() {
        return ReadingPom.RenderedSegments()
            .find('mark')
    }
}