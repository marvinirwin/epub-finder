import GoogleButton from "react-google-button";
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function GoogleSigninNode(): TreeMenuNode {
    return {
        name: 'google',
        LeftIcon: () => <GoogleButton
            onClick={() => window.location.href = `${process.env.PUBLIC_URL}/auth/google`}
        />,
        label: 'google'
    };
}