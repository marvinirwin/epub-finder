import { merge, Observable, ReplaySubject, Subject } from 'rxjs'
import { AlertMessage, AlertsService } from '../../services/alerts.service'
import { map, scan, shareReplay, tap } from 'rxjs/operators'

export class ToastMessageService<T> {
    public toastMessageList$: Observable<ToastMessage<T>[]>
    public addToastMessage$: Observable<ToastMessage<T>>
    private expiredToasts$ = new ReplaySubject<ToastMessage<T>>(1)
    public alertMessagesVisible$ = new ReplaySubject<boolean>(1)

    constructor({
        addToastMessage$,
    }: {
        addToastMessage$: Observable<ToastMessage<T>>
    }) {
        /*
        this.addToastMessage$ = alertsService.newAlerts$.pipe(
            map(alert => new ToastMessage(10000, alert)),
            tap(alert => {
                alert.expired$.subscribe(() => this.expiredToasts$.next(alert))
            }),
            shareReplay(1)
        )
*/
        this.addToastMessage$ = addToastMessage$.pipe(
            tap((toastMessage) => {
                toastMessage.expired$.subscribe(() =>
                    this.expiredToasts$.next(toastMessage),
                )
            }),
        )
        this.toastMessageList$ = merge(
            this.addToastMessage$.pipe(map((t) => ({ add: t }))),
            this.expiredToasts$.pipe(map((t) => ({ remove: t }))),
        ).pipe(
            scan(
                (
                    allToasts: ToastMessage<T>[],
                    {
                        add,
                        remove,
                    }: { add?: ToastMessage<T>; remove?: ToastMessage<T> },
                ): ToastMessage<T>[] => {
                    const withoutExpired = allToasts.filter((v) => v !== remove)
                    if (add) {
                        return withoutExpired.concat(add)
                    }
                    return withoutExpired
                },
                [] as ToastMessage<T>[],
            ),
            tap((messages) => {
                if (messages.length) {
                    this.alertMessagesVisible$.next(true)
                }
            }),
            shareReplay(1),
        )
    }
}

export class ToastMessage<T> {
    expired$ = new Subject<void>()

    constructor(durationMs: number, public content: T) {
        setTimeout(() => this.expired$.next(), durationMs)
    }
}
