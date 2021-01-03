import {Manager} from "../../../lib/Manager";
import {Profile} from "../../../lib/Auth/loggedInUserService";

export function SignoutNode(m: Manager, profile: undefined | Profile) {
    return {
        name: 'signOut',
        label: 'Sign Out',
        action: () => m.authManager.signOut(),
        hidden: !profile?.email
    };
}