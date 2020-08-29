import {Observable, ReplaySubject} from "rxjs";
import {switchMap} from "rxjs/operators";
import axios from 'axios';

var getCookie = function(name: string) {
    var cookies = document.cookie.split(';');
    for(var i=0 ; i < cookies.length ; ++i) {
        var pair = cookies[i].trim().split('=');
        if(pair[0] == name)
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
    static async FromSessionId(sessionid: string) {
        const response = await axios.get('/profile');
        return new User(
            response.data.name, response.data.picture
        );
    }
}

export class AuthenticationMonitor {
    sessionId$ = new ReplaySubject<string>(1);
    user$: Observable<User | undefined>;

    constructor() {
        this.user$ = this.sessionId$.pipe(
            switchMap(async sessionId => {
                if (!sessionId) {
                    return undefined;
                }
                return User.FromSessionId(sessionId);
            })
        );
        setInterval(() => {
            const sessionId = getCookie('connect.sid');
            if (sessionId) this.sessionId$.next(sessionId);
        }, 1000);
    }
}