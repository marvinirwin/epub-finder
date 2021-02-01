import {Profile} from "../../../lib/Auth/loggedInUserService";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {AccountCircle} from "@material-ui/icons";
import keycloak from "../../keycloak/keycloak";

export function SignInWithNode(profile: Profile | undefined): TreeMenuNode {
    return {
        name: 'signInWith',
        label: 'Sign In With',
/*
        moveDirectory: true,
*/
        hidden: !!profile?.email,
        LeftIcon: () => <AccountCircle/>,
        action: () => keycloak.login()
    };
}