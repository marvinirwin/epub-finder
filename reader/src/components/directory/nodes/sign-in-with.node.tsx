import {Profile} from "../../../lib/Auth/loggedInUserService";
import {TreeMenuNode} from "../tree-menu-node.interface";
import React from "react";
import {Settings} from "@material-ui/icons";

export function SignInWithNode(profile: Profile | undefined): TreeMenuNode {
    return {
        name: 'signInWith',
        label: 'Sign In With',
        moveDirectory: true,
        hidden: !!profile?.email,
        LeftIcon: () => <Settings/>
    };
}