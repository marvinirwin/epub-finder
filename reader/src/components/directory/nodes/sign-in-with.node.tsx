import {Profile} from "../../../lib/Auth/loggedInUserService";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {AccountCircle} from "@material-ui/icons";

export function SignInWithNode(profile: Profile | undefined): TreeMenuNode {
    return {
        name: 'signInWith',
        label: 'Sign In With',
        action: () => window.location.href = `${process.env.PUBLIC_URL}/auth/keycloak`,
        hidden: !!profile?.email,
        LeftIcon: () => <AccountCircle/>
    };
}