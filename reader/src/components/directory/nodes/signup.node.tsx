import React from "react";
import {TESTING} from "../app-directory-service";
import {SignupLogin} from "./signup.component";

export function SignupNode() {
    return {
        name: 'signup',
        hidden: !TESTING,
        ReplaceComponent: SignupLogin
    };
}
