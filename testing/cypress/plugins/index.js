// cypress/plugins/index.ts

/// <reference types="cypress" />

const { uniqueNamesGenerator, Config, adjectives, colors, animals, starWars } = require('unique-names-generator');


const email = () => uniqueNamesGenerator({dictionaries: [colors, animals]})
const password = () => uniqueNamesGenerator({dictionaries: [starWars]})

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    on("task", {
        async randomEmailPassword() {
            return {
                email: email(),
                password: password()
            }
        }
    })
}
