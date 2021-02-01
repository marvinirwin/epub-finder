import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import keycloak from "../../keycloak/keycloak";

export function KeycloakSignInNode(): TreeMenuNode {
    return {
        name: 'keycloak',
        LeftIcon: () => <a>Account</a> ,
        label: 'Your Account',
        action: () => keycloak.login()
    };
}