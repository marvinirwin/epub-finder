const getIframeDocument = (selector: string) => {
    return cy
        .get(selector)
        .its('0.contentDocument').should('exist')
}

export const getIframeBody = (selector: string) => {
    return getIframeDocument(selector)
        .its('body').should('not.be.undefined')
        .then(cy.wrap)
}

