// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

declare namespace Cypress {
    interface Chainable {
        signupLogin(): Chainable<void>

        skipIntro(): Chainable<void>

        iframeBody(): Chainable<void>

        clearIndexedDB(): Chainable<void>

        visitHome(): Chainable<void>

        signup(): Chainable<{email: string, password: string}>

        login(credentials: {email: string, password: string}): Chainable<void>
    }
}

Cypress.Commands.add('visitHome', () => {
    cy.visit('http://localhost:3000/?test=1&skip_intro=1');
})

Cypress.Commands.add('signupLogin', () => {
    cy.visitHome();
    cy.signup();
});

Cypress.Commands.add('signup', () => {
    cy.task('randomEmailPassword')
        .then(({email, password}) => {
                cy.wait(1000)
                    .get('#signup-email').type(email)
                    .get('#signup-password').type(password)
                    .get('#signup-button').click()
                return {email, password};
            }
        )
});

Cypress.Commands.add('login', ({email, password}) => {
    cy.get('#login-email').type(email)
    cy.get('#login-password').type(password)
    cy.get('#login-button').click()
})

Cypress.Commands.add('iframeBody', {
    prevSubject: true
}, (subject) => {
    return cy.wrap(subject)
        .its('0.contentDocument').should('exist')
        .its('body').should('not.be.undefined')
        .then(cy.wrap)
});


Cypress.Commands.add('clearIndexedDB', async () => {
    // @ts-ignore
    const databases = await window.indexedDB.databases();

    await Promise.all(
        databases.map(
            ({name}) =>
                new Promise((resolve, reject) => {
                    const request = window.indexedDB.open(name);
                    request.onsuccess = event => {
                        const db = request.result;
                        let storeNames = [
                            'cards',
                            // cards: 'id++, learningLanguage, knownLanguage, deck',
                            'wordRecognitionRecords',
                            // wordRecognitionRecords: 'id++, word, timestamp',
                            'pronunciationRecords',
                            // pronunciationRecords: 'id++, word, timestamp',
                            'settings2',
                            // settings2: 'name, value',
                            'createdSentences',
                            // createdSentences: 'id++, learningLanguage',
                            'customDocuments',
                            // customDocuments: 'name, html'
                        ];
                        const transaction = db.transaction(storeNames, 'readwrite')
                        storeNames.forEach(storeName => transaction.objectStore(storeName).clear())
                        transaction.oncomplete = resolve;
                    };

                    // Note: we need to also listen to the "blocked" event
                    // (and resolve the promise) due to https://stackoverflow.com/a/35141818
                    request.addEventListener('blocked', resolve);
                    request.addEventListener('error', reject);
                }),
        ),
    );
});


Cypress.Commands.add('skipIntro', () => {
    /*
        cy.get('.introjs-skipbutton')
            .then(el => {
                if (el) {
                    el.click()
                }
            })
    */
})
