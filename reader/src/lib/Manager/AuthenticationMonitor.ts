import {Observable, ReplaySubject} from "rxjs";
import {switchMap} from "rxjs/operators";
import axios from 'axios';

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
        )
    }
}