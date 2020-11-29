import {combineLatest, fromEvent, Observable, of, ReplaySubject, Subject} from "rxjs";
import {fetchVideoMetadata, sha1} from "../../services/video.service";
import {distinctUntilChanged, map, mapTo, switchMap} from "rxjs/operators";
import {VideoMetadata} from "../../types";
import Ciseaux, { Tape } from 'ciseaux/browser';
Ciseaux.context = new AudioContext();


export class PronunciationVideoService {
    public videoMetadata$ = new ReplaySubject<VideoMetadata | undefined>(1);
    public videoSentence$ = new ReplaySubject<string | undefined>(1);
    public setVideoPlaybackTime$ = new Subject<number>();
    public distinctSetVideoPlaybackTime$: Observable<number>;
    public videoPlaybackTime$ = new ReplaySubject<number>(1);
    public playing$ = new ReplaySubject<boolean>(1);
    public videoRef$ = new ReplaySubject<HTMLVideoElement | null>(1)
    public audioUrl$ = new ReplaySubject<string>(1)
    public tape$: Observable<Tape | void>;
    public chunkSizeSeconds$ = new ReplaySubject<number | undefined>(1)
    public chunkedAudioBuffers$: Observable<AudioBuffer[]>

    constructor( ) {
        this.videoSentence$.subscribe(async sentence => {
            this.videoMetadata$.next();
            if (sentence) {
                this.videoMetadata$.next(await fetchVideoMetadata(sentence));
            }
        });
        this.videoMetadata$.subscribe(v =>
            {
                if (v) {
                    this.audioUrl$.next(`${process.env.PUBLIC_URL}/video/${v.audioFilename || `${sha1(v.sentence)}.wav`}`)
                }
            }
        )
        this.distinctSetVideoPlaybackTime$ = this.setVideoPlaybackTime$.pipe(distinctUntilChanged());
        this.tape$ = this.audioUrl$.pipe(
            switchMap(audioUrl =>
                Ciseaux.from(audioUrl)
                    .catch(e => console.warn(e))
            )
        )
        this.chunkedAudioBuffers$ = combineLatest([
            this.tape$,
            this.chunkSizeSeconds$,
        ]).pipe(
            switchMap(([tape, chunkSizeSeconds]) => {
                if (!tape || !chunkSizeSeconds) return [];
                const tapes = [];
                let i = 0;
                while (i < chunkSizeSeconds) {
                    tapes.push(tape.slice(i, i + chunkSizeSeconds))
                }
                return Promise.all(tapes.map(tape => tape.render()));
            })
        )
    }
}