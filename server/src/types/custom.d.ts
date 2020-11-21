/// <reference types="express" />
import {Profile} from "passport";

/*
export declare namespace Express {
    import {User} from "../entities/User";


    export interface Response {
    }

    export interface Application {
    }

    export interface Request {
        user: User;
        userId: number;
        body: {[key: string]: any};
    }
}
*/

declare namespace Profiles {
    interface GithubProfile extends Profile {
        avatar_url: string | undefined;
        location: string | undefined;
        blog: string | undefined;
        /*
                u.profile_picture = u.profile_picture || profile.avatar_url;
                u.profile_location = u.profile_location || profile.location;
                u.profile_website = u.profile_website || profile.blog;
        */
    }

    interface TwitterProfile extends Profile {
        displayName: string;
        location: string;
        profile_image_url_https: string;
    }

    interface GoogleProfile extends Profile {
        gender: string;
        picture: string;
    }
}
