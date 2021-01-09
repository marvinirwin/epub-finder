import {Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, shareReplay} from "rxjs/operators";

export class HistoryService {
    private _url$ = new ReplaySubject<URL>(1);
    url$: Observable<URL>;
    constructor() {
        window.onpopstate = () => {
            const url = new URL(window.location.pathname);
            this._url$.next(url);
        };
        this.url$ = this._url$.pipe(
            distinctUntilChanged((url1, url2) => url1.pathname === url2.pathname),
            shareReplay(1)
        )
    }
    public set(k: string, v: string) {
        const url = HistoryService.url();
        url.searchParams.set(k, v);
        window.history.pushState({}, '', url.pathname)
        this._url$.next(url);
    }
    public get(k: string): string | null {
        return HistoryService.url().searchParams.get(k)
    }
    private static url() {
        return new URL(window.location.pathname)
    }
}