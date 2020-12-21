import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {Color} from "@material-ui/lab";
import {map} from "rxjs/operators";
import axios, {AxiosError, AxiosResponse} from "axios";

type AlertMessage = { severity: Color, msg: string };

export class AlertsService {
    public static pipeToColor = (color: Color) => (o$: Observable<string>): Observable<AlertMessage> => o$.pipe(map(msg => ({
        msg,
        severity: color
    })))

    public alertMessages$ = new BehaviorSubject<AlertMessage[]>([]);
    public newAlerts$ = new ReplaySubject<AlertMessage>(1);
    public alertMessagesVisible$ = new ReplaySubject<boolean>(1);

    constructor() {
        this.newAlerts$.subscribe(({msg, severity}) => {
            this.appendAlertMessage(msg, severity);
        })
        axios.interceptors.response.use(
            response => response,
            (error) => {
                // if has response show the error
                const msg = error?.response?.data?.message || error?.response?.statusCode;
                if (msg) {
                    this.newAlerts$.next({msg, severity: 'error'})
                }
            }
        );
    }

    private appendAlertMessage(msg: string, color: Color) {
        const messages = this.alertMessages$.getValue();
        const MAX_MESSAGES = 10;
        const sliceStart = messages.length - MAX_MESSAGES > 0 ? messages.length - MAX_MESSAGES : 0;
        this.alertMessagesVisible$.next(true);
        this.alertMessages$.next(messages.concat({msg, severity: color}).slice(sliceStart, sliceStart + MAX_MESSAGES));
    }

    info(msg: string) {
        this.newAlerts$.next({msg, severity: "info"})
    }
}