import {Profile} from "../../../lib/Auth/loggedInUserService";
import React from "react";
import {Settings} from "@material-ui/icons";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function ProfileNode(profile: { email: string | undefined } | Profile | undefined): TreeMenuNode {
    return {
        name: 'profile',
        label: profile?.email || '',
        hidden: !profile,
        LeftIcon: () => <Settings/>
    };
}