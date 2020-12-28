import React from "react";
import {TESTING} from "../app-directory-service";
import {Signup} from "./signup.component";

export function SignupNode() {
    return {
        name: 'signup',
        hidden: !TESTING,
        ReplaceComponent: Signup
    };
}
