import {Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, shareReplay} from "rxjs/operators";

export class HistoryService {
    private _url$ = new ReplaySubject<URL>(1);
    url$: Observable<URL>;
    constructor() {
        window.onpopstate = () => {
            this._url$.next(HistoryService.url());
        };
        this.url$ = this._url$.pipe(
            distinctUntilChanged((url1, url2) => {
                return url1.href !== url2.href;
            }),
            shareReplay(1)
        )
    }
    public set(k: string, v: string) {
        const url = HistoryService.url();
        url.searchParams.set(k, v);
        window.history.pushState({}, '', url.href)
        this._url$.next(url);
    }
    public get(k: string): string | null {
        return HistoryService.url().searchParams.get(k)
    }
    private static url() {
        return new URL(window.location.href)
    }
}