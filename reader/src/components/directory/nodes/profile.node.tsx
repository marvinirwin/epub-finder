import {Profile} from "../../../lib/auth/loggedInUserService";
import React from "react";
import { Face} from "@material-ui/icons";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function ProfileNode(profile: { email: string | undefined } | Profile | undefined): TreeMenuNode {
    return {
        name: 'profile',
        label: profile?.email || '',
        hidden: !profile,
        LeftIcon: () => <Face/>
    };
}