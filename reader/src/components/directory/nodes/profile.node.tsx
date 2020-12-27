import {Profile} from "../../../lib/Auth/loggedInUserService";

export function ProfileNode(profile: { email: string | undefined } | Profile | undefined) {
    return {
        name: 'profile',
        label: profile?.email,
        hidden: !!profile
    };
}