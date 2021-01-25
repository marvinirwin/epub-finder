import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {FcGoogle} from 'react-icons/fc';

export function GoogleSigninNode(): TreeMenuNode {
    return {
        name: 'google',
        LeftIcon: () => <FcGoogle size={'1.5em'} /*style={{fontSize: '1.5em'}}*//> ,
        label: 'google',
        action: () => window.location.href = `${process.env.PUBLIC_URL}/auth/google`
    };
}