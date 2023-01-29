import {ReplaySubject} from "rxjs";

export class LoadingSignal {
    public isLoading$ = new ReplaySubject<boolean>(1);
    public latestMessage$ = new ReplaySubject<string>(1)
    constructor() {
        this.isLoading$.next(false);
    }
}