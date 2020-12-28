export class ReadingPom {
    public static frame() {
        return cy.get('#reading-document')
            .iframeBody()
    }

    public static AtomizedSentences() {
        return ReadingPom
            .frame()
            .find('.annotated_and_translated')
    }

    public static Marks() {
        return ReadingPom.AtomizedSentences()
            .find('mark')
    }
}