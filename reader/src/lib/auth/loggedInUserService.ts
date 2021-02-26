import {Observable, ReplaySubject} from "rxjs";
import axios from 'axios';
import {map, shareReplay} from "rxjs/operators";

export interface Profile {
    email: string;
}

export class LoggedInUserService {
    profile$ = new ReplaySubject<Profile | undefined>(1);
    isLoggedIn$: Observable<boolean>;

    public static async fetchLoggedInProfile(): Promise<Profile | undefined> {
        const response = await axios.get(`${process.env.PUBLIC_URL}/users/profile`);
        return response?.data as Profile;
    }

    constructor() {
        this.isLoggedIn$ = this.profile$.pipe(
            map(profile => !!profile), shareReplay(1)
        );
        this.profile$.next(undefined)
        // Right now we only sign in with some
        this.fetchProfile();
    }

    public async fetchProfile() {
        try {
            const user = await LoggedInUserService.fetchLoggedInProfile();
            // If there's no user then an error will have been shown to the user
            this.profile$.next(user);
        } catch (e) {
            console.warn(e);
        }
    }

    public async signOut() {
        await axios.get(`${process.env.PUBLIC_URL}/languagetrainer-auth/logout`)
        this.profile$.next(undefined);
    }
}