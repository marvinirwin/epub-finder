import {
    combineLatest,
    Observable,
    ReplaySubject,
    Subject,
} from 'rxjs'
import { fetchVideoMetadata, sha1 } from '../../services/video.service'
import {
    distinctUntilChanged,
    shareReplay,
    switchMap,
} from 'rxjs/operators'
import Ciseaux from '../../lib/ciseaux/browser'
import { Tape } from 'ciseaux/browser'
import { filterData } from '../../lib/audio/audio-graphing'
import {audioContext} from "../../lib/audio/audio-context";
import { VideoMetadata } from 'languagetrainer-server/src/shared'

export const ciseauxPromise = audioContext.then(ctx => {
    // @ts-ignore
    Ciseaux.context = ctx;
    return Ciseaux;
})

export class PronunciationVideoService {
    public videoMetadata$ = new ReplaySubject<VideoMetadata | undefined>(1)
    public videoSentence$ = new ReplaySubject<string | undefined>(1)
    public setVideoPlaybackTime$ = new Subject<number>()
    public distinctSetVideoPlaybackTime$: Observable<number>
    public videoPlaybackTime$ = new ReplaySubject<number>(1)
    public playing$ = new ReplaySubject<boolean>(1)
    public canPlay$ = new ReplaySubject<boolean>(1)
    public videoRef$ = new ReplaySubject<HTMLVideoElement | null>(1)
    public audioUrl$ = new ReplaySubject<string>(1)
    public tape$: Observable<Tape | void>
    public chunkSizeSeconds$ = new ReplaySubject<number | undefined>(1)
    public chunkedAudioBuffers$: Observable<{
        chunkedAudioBuffers: AudioBuffer[]
        max: number
    }>

    constructor() {
        this.videoSentence$
            .pipe(distinctUntilChanged())
            .subscribe(async (sentence) => {
                this.videoMetadata$.next()
                if (sentence) {
                    this.videoMetadata$.next(await fetchVideoMetadata(sentence))
                }
            })
        this.videoMetadata$.subscribe(async (v) => {
            if (v) {
                const hash = await sha1(v.sentence)
                this.audioUrl$.next(
                    `${process.env.PUBLIC_URL}/video/${
                        v.audioFilename || `${hash}.wav`
                    } `,
                )
            }
        })
        this.distinctSetVideoPlaybackTime$ = this.setVideoPlaybackTime$.pipe(
            distinctUntilChanged(),
            shareReplay(1),
        )
        this.tape$ = this.audioUrl$.pipe(
            // @ts-ignore
            switchMap(async (audioUrl) => {
                return (await ciseauxPromise).from(audioUrl).catch((e: any) => console.warn(e))
            }),
            shareReplay(1),
        )
        this.chunkedAudioBuffers$ = combineLatest([
            this.tape$,
            this.chunkSizeSeconds$,
        ]).pipe(
            switchMap(async ([tape, chunkSizeSeconds]) => {
                if (!tape || !chunkSizeSeconds)
                    return { chunkedAudioBuffers: [], max: 0 }
                const tapes = []
                const normalMax = Math.max(
                    ...filterData(await tape.render(), 1000),
                )
                let i = 0
                while (i < tape.duration) {
                    tapes.push(
                        tape.slice(
                            i,
                            /*Math.min(i + chunkSizeSeconds, tape.duration)*/ chunkSizeSeconds,
                        ),
                    )
                    i += chunkSizeSeconds
                }
                const arrays = await Promise.all(
                    tapes.map((tape) => tape.render()),
                )
                return { chunkedAudioBuffers: arrays, max: normalMax }
            }),
            shareReplay(1),
        )
    }
}
