import {merge, Observable, ReplaySubject, Subject} from "rxjs";
import {AlertMessage, AlertsService} from "../services/alerts.service";
import {Toast} from "react-toastify";
import {map, scan, shareReplay, tap} from "rxjs/operators";

export class ToastMessageService {
    public toastMessageList$: Observable<ToastMessage[]>
    public addToastMessage$: Observable<ToastMessage>;
    private expiredToasts$ = new ReplaySubject<ToastMessage>(1);

    constructor(
        {
            alertsService
        }: {
            alertsService: AlertsService
        }
    ) {
        this.addToastMessage$ = alertsService.newAlerts$.pipe(
            map(alert => new ToastMessage(10000, alert)),
            tap(alert => {
                alert.expired$.subscribe(() => this.expiredToasts$.next(alert))
            }),
            shareReplay(1)
        )
        this.toastMessageList$ = merge(
            this.addToastMessage$.pipe(map(t => ({add: t}))),
            this.expiredToasts$.pipe(map(t => ({remove: t})))
        ).pipe(
            scan((
                allToasts: ToastMessage[],
                {add, remove}: {add?: ToastMessage, remove?: ToastMessage}
            ): ToastMessage[] => {
                const withoutExpired = allToasts.filter(v => v !== remove);
                if (add) {
                    return withoutExpired.concat(add);
                }
                return withoutExpired
            }, [] as ToastMessage[]),
            shareReplay(1)
        )
    }
}

export class ToastMessage {
    expired$ = new Subject<void>()

    constructor(
        durationMs: number,
        public alert: AlertMessage
    ) {
        setTimeout(() => this.expired$.next(), durationMs)
    }


}