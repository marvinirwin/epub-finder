import {Profile} from "../../../lib/Auth/loggedInUserService";

export function SignInWithNode(profile: Profile | undefined) {
    return {
        name: 'signInWith',
        label: 'Sign In With',
        moveDirectory: true,
        hidden: !!profile?.email
    };
}