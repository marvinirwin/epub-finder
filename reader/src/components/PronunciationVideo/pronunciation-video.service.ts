import {Observable, ReplaySubject, Subject} from "rxjs";
import {VideoMetadata} from "./video-meta-data.interface";
import {fetchVideoMetadata} from "../../services/video.service";

export class PronunciationVideoService {
    public videoMetaData$ = new ReplaySubject<VideoMetadata | undefined>(1);
    public videoSentence$ = new ReplaySubject<string | undefined>(1);
    public setVideoPlaybackTime$ = new Subject<number>();
    public videoPlaybackTime$ = new ReplaySubject<number>(1);
    public playing$ = new ReplaySubject<boolean>(1);

    constructor( ) {
        this.videoSentence$.subscribe(async sentence => {
            this.videoMetaData$.next();
            if (sentence) {
                this.videoMetaData$.next(await fetchVideoMetadata(sentence));
            }
        });
    }
}