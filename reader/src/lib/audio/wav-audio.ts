import { from, Observable, of } from 'rxjs'
import { encode } from 'base64-arraybuffer'
import { concatMap, delay, filter, map, withLatestFrom } from 'rxjs/operators'
import { chunk } from 'lodash'
import {
    AUDIO_GRAPH_SAMPLE_SIZE,
    filterData,
    normalizeData,
} from './audio-graphing'
import { audioContext } from './audio-context'

export class WavAudio {
    blob: Blob
    url: string
/*
    el: HTMLAudioElement
*/
    duration$: Observable<number>
    audioBuffer$: Observable<AudioBuffer>
    graphData$: Observable<number[]>

    private graphObservable$: Observable<Observable<number[]>>
/*
    private src: string
*/

    constructor(public buffer: ArrayBuffer) {
        // decodeAudioData detached the arraybuffer into the audio thread
        const newBuffer = buffer.slice(0)
        this.audioBuffer$ = from(
            audioContext.then(async (ctx) => {
                try {
                    // THis is the problem on safari
                    const audioBufferPromise = await ctx.decodeAudioData(buffer);
                    return audioBufferPromise
                } catch (e) {
                    console.error(e)
                    throw e
                }
            }),
        )
        this.blob = new Blob([newBuffer], { type: 'audio/wav' })
        this.url = URL.createObjectURL(this.blob)
/*
        this.src = 'data:audio/wav;base64,' + encode(newBuffer)
        this.el = new Audio(this.src)
*/
        this.duration$ = this.audioBuffer$.pipe(map((b) => b.duration))
        this.graphData$ = this.audioBuffer$.pipe(
            map((b) => {
                const filteredData = filterData(b, AUDIO_GRAPH_SAMPLE_SIZE)
                return normalizeData(filteredData, Math.max(...filteredData))
            }),
        )

        this.graphObservable$ = this.graphData$.pipe(
            withLatestFrom(this.audioBuffer$, this.duration$),
            map(([graphData, audioBuffer, duration]) => {
                const updateInterval = 250
                const chunkSize = graphData.length / (duration / updateInterval)
                const chunks = chunk(graphData, chunkSize)
                return from(chunks).pipe(
                    concatMap((chunk) => of(chunk).pipe(delay(updateInterval))),
                )
            }),
        )
    }
}
