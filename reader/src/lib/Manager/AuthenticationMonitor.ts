import {interval, Observable, ReplaySubject} from "rxjs";
import {switchMap, withLatestFrom} from "rxjs/operators";
import axios from 'axios';

var getCookie = function (name: string) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; ++i) {
        var pair = cookies[i].trim().split('=');
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

export class AuthenticationMonitor {
    user$ = new ReplaySubject<User>(1);

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
}