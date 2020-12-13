import {ReplaySubject} from "rxjs";
import axios from 'axios';

export interface Profile {
    email: string;
}

export class AuthService {
    profile$ = new ReplaySubject<Profile>(1);

    public static async fetchLoggedInProfile() {
        const response = await axios.get(`${process.env.PUBLIC_URL}/users/profile`);
        return response.data as Profile;
    }

    constructor() {
        // Right now we only sign in with some
        this.fetchProfileData();
    }

    private fetchProfileData() {
        (async () => {
            try {
                const user = await AuthService.fetchLoggedInProfile();
                this.profile$.next(user);
            } catch (e) {
                console.warn(e);
            }
        })();
    }
}