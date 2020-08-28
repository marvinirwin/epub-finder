import {Observable, ReplaySubject} from "rxjs";
import {switchMap} from "rxjs/operators";

export class User {
    usage$ = new ReplaySubject<number>();
    maxUsage$ = new ReplaySubject<number>();
    constructor(
        public name: string, public picture: string
    ) {
    }
    static async FromSessionId(sessionid: string) {
        await axios.get('')
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
                return
            })
        )
    }
}