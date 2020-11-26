import {Observable, ReplaySubject, Subject} from "rxjs";
import {fetchVideoMetadata} from "../../services/video.service";
import {distinctUntilChanged} from "rxjs/operators";
import {VideoMetadata} from "../../types";

export class PronunciationVideoService {
    public videoMetadata$ = new ReplaySubject<VideoMetadata | undefined>(1);
    public videoSentence$ = new ReplaySubject<string | undefined>(1);
    public setVideoPlaybackTime$ = new Subject<number>();
    public distinctSetVideoPlaybackTime$: Observable<number>;
    public videoPlaybackTime$ = new ReplaySubject<number>(1);
    public playing$ = new ReplaySubject<boolean>(1);

    constructor( ) {
        this.videoSentence$.subscribe(async sentence => {
            this.videoMetadata$.next();
            if (sentence) {
                this.videoMetadata$.next(await fetchVideoMetadata(sentence));
            }
        });
        this.distinctSetVideoPlaybackTime$ = this.setVideoPlaybackTime$.pipe(distinctUntilChanged())
    }
}