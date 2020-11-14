import {Observable, ReplaySubject} from "rxjs";
import {VideoMetaData} from "./video-meta-data.interface";
import {fetchVideoMetadata} from "../../services/video.service";

export class PronunciationVideoService {
    videoMetaData$ = new ReplaySubject<VideoMetaData | undefined>(1);
    videoSentence$ = new ReplaySubject<string | undefined>(1);

    constructor() {

        this.videoSentence$.subscribe(async sentence => {
            this.videoMetaData$.next();
            if (sentence) {
                this.videoMetaData$.next(await fetchVideoMetadata(sentence));
            }
        })
    }
}