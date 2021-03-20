import {Manager} from "../../../lib/Manager";
import {Profile} from "../../../lib/auth/loggedInUserService";
import {Settings} from "@material-ui/icons";
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function SignoutNode(m: Manager, profile: undefined | Profile): TreeMenuNode {
    return {
        name: 'signOut',
        label: 'Sign Out',
        action: () => m.authManager.signOut(),
        LeftIcon: () => <Settings/>,
        hidden: !profile?.email
    };
}