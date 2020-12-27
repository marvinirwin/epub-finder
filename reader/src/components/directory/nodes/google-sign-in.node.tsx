import GoogleButton from "react-google-button";
import React from "react";

export function GoogleSigninNode() {
    return {
        name: 'google',
        ReplaceComponent: () => <GoogleButton
            onClick={() => window.location.href = `${process.env.PUBLIC_URL}/auth/google`}
        />
    };
}