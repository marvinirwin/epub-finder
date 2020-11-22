import {fromEvent, merge, Observable} from "rxjs";
import {VideoMetadata} from "../components/PronunciationVideo/video-meta-data.interface";
import {mapTo, switchMap, tap} from "rxjs/operators";
import {Socket} from 'socket.io-client';

export class ObservableService {
    public videoMetadata$: Observable<VideoMetadata>;
    public connected$: Observable<boolean>;
    private connection$: Observable<Socket>
    constructor() {
        this.videoMetadata$ = this.connection$.pipe(
            switchMap(connection => fromEvent(connection, 'videoMetadata'))
        );

        this.connected$ = this.connection$.pipe(
            switchMap(connection => merge(
                fromEvent(connection, 'open').pipe(mapTo(true)),
                fromEvent(connection, 'close').pipe(mapTo(false))
                )
            )
        )
    }
    attemptConnection() {
        this.connection$.next(
            new Socket(`http://${process.env.PUBLIC_URL}/socket`)
        )
    }
}