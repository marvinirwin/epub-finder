import {fromEvent, merge, Observable, ReplaySubject} from "rxjs";
import {mapTo, shareReplay, switchMap, tap} from "rxjs/operators";
// @ts-ignore
import {io}  from "socket.io-client";
import { VideoMetadata } from "src/components/pronunciation-video/video-meta-data.interface";

export class ObservableService {
    public videoMetadata$: Observable<VideoMetadata>;
    public latestVideoMetadata$: Observable<VideoMetadata>;
    public connected$: Observable<boolean>;
    private connection$ = new ReplaySubject<io>(1);
    constructor() {
        this.videoMetadata$ = this.connection$.pipe(
            switchMap(connection => fromEvent(connection, 'videoMetadata') as Observable<VideoMetadata>)
        );
        this.latestVideoMetadata$ = this.videoMetadata$.pipe(
            shareReplay(1)
        )

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
            new io( `http://${process.env.PUBLIC_URL}/socket` )
        )
    }
}