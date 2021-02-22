import {Profile} from "../../../lib/auth/loggedInUserService";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {AccountCircle} from "@material-ui/icons";
import {AUTH} from "@shared/";


export const SignInWithNode = (profile: Profile | undefined): TreeMenuNode => ({
    name: AUTH,
    label: 'Sign In With',
    action: () => window.location.href = `${process.env.PUBLIC_URL}/auth/keycloak`,
    hidden: !!profile?.email,
    LeftIcon: () => <AccountCircle/>
});