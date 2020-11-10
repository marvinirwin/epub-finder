import {interval, Observable, ReplaySubject} from "rxjs";
import {switchMap, withLatestFrom} from "rxjs/operators";
import axios from 'axios';

const getCookie = function (name: string) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; ++i) {
        const pair = cookies[i].trim().split('=');
        if (pair[0] == name)
            return pair[1];
    }
    return null;
};

export interface Profile {
    name: string;
    picture: string;
    location: string | null;
    website: string;
    usedBudget: number;
    maxBudget: number;
}

export class User {
    usage$ = new ReplaySubject<number>();
    maxUsage$ = new ReplaySubject<number>();

    constructor(
        public profile: Profile,
    ) {
    }

    static async FetchUserInfo() {
        const response = await axios.get(`${process.env.PUBLIC_URL}/profile`);
        return new User(
            response.data
        );
    }
}

interface AuthOption {
    url: string;
    icon: string;
    label: string;
}

export class AuthManager {
    user$ = new ReplaySubject<User>(1);
    authOptions$ = new ReplaySubject<AuthOption[]>(1);

    constructor() {
        this.fetchProfileData();
        interval(5000).pipe(
            withLatestFrom(this.user$)
        ).subscribe(([_, user]) => {
            if (!user) {
                this.fetchProfileData();
            }
        })
    }

    private fetchProfileData() {
        (async () => {
            try {
                const user = await User.FetchUserInfo();
                this.user$.next(user);
            } catch (e) {
                console.warn(e);
            }
        })();
    }

    private fetchAuthOptions() {
        (async () => {
            try {
                const user = await User.FetchUserInfo();
                this.user$.next(user);
            } catch (e) {
                console.warn(e);
            }
        })();
    }
}