import React from "react";
import {TESTING} from "../app-directory-service";
import {SignupLogin} from "./signup.component";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function SignupNode(): TreeMenuNode {
    return {
        name: 'signup',
        hidden: !TESTING,
        label: "signuplogin",
        LeftIcon: () => <SignupLogin/>
    };
}
