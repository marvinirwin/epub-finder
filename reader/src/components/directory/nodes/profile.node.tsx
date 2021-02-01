import {Profile} from "../../../lib/Auth/loggedInUserService";
import React from "react";
import { Face} from "@material-ui/icons";
import {TreeMenuNode} from "../tree-menu-node.interface";
import keycloak from "../../keycloak/keycloak";

export function ProfileNode(profile: { email: string | undefined } | Profile | undefined): TreeMenuNode {
    return {
        name: 'profile',
        label: profile?.email || '',
        hidden: !profile,
        LeftIcon: () => <Face/>,
        action: () => keycloak.login()
    };
}