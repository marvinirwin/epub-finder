import {Observable, ReplaySubject} from "rxjs";
import {switchMap} from "rxjs/operators";
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
}

export class User {
    usage$ = new ReplaySubject<number>();
    maxUsage$ = new ReplaySubject<number>();

    constructor(
        public name: string, public picture: string
    ) {
    }

    static async RetrieveUserInfo() {
        const response = await axios.get('/profile');
        return new User(
            response.data.name,
            response.data.picture
        );
    }
}

export class AuthenticationMonitor {
    user$ = new ReplaySubject<User>();

    constructor() {
        setInterval(async () => {
            try {
                const user = await User.RetrieveUserInfo();
                this.user$.next(user);
            } catch (e) {
                console.warn(e);
            }
        }, 1000);
    }
}