export class ImageSearchPom {
    public static SearchResults() {
        return cy.get('.image-search-result')
    }
    public static SelectFirstSearchResult() {
        return ImageSearchPom.SearchResults().click()
    }
}