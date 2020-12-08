import {ReplaySubject, Subject} from "rxjs";
import {filter, take} from "rxjs/operators";

export class RefreshableService<T> {
    private latestValid$ = new ReplaySubject<T | undefined>(1);
    private isFetching: boolean = false;
    private latest: T | undefined = undefined;
    constructor(
        private isValid: (v: T) => boolean | Promise<boolean>,
        private fetchNew: () => T | Promise<T>
    ) {
        this.latestValid$.subscribe(latest => this.latest = latest);
    }
    public async get(): Promise<T> {
        const shouldFetchNew = (!this.latest || !this.isValid(this.latest) && !this.isFetching);
        if (shouldFetchNew) {
            this.isFetching = true;
            const newFetchable = await this.fetchNew();
            this.latestValid$.next(newFetchable);
            this.isFetching = false;
            return this.get();
        }
        return this.latestValid$
            .pipe(
                filter(v => v !== undefined),
                take(1)).toPromise() as Promise<T>;
    }
}