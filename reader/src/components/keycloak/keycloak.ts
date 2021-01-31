import Keycloak from 'keycloak-js'

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
// @ts-ignore
const keycloak = new Keycloak(
    {
        "realm": "master",
        // @ts-ignore
        "auth-server-url": "http://localhost:8080/auth/",
        "ssl-required": "external",
        "resource": "language-trainer-wds",
        "public-client": true,
        "confidential-port": 0
    }
);

export default keycloak
