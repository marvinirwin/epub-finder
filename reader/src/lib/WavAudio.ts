import {from, Observable, of} from "rxjs";
import {encode} from "base64-arraybuffer";
import {concatMap, delay, map, withLatestFrom} from "rxjs/operators";
import {chunk} from "lodash";
import {AUDIO_GRAPH_SAMPLE_SIZE, audioContext, filterData, normalizeData} from "./AudioRecorder";

export class WavAudio {
    blob: Blob;
    url: string;
    el: HTMLAudioElement;
    duration$: Observable<number>;
    audioBuffer$: Observable<AudioBuffer>;
    graphData$: Observable<number[]>;

    private graphObservable$: Observable<Observable<number[]>>;

    constructor(public buffer: ArrayBuffer) {
        // decodeAudioData detached the arraybuffer into the audio thread
        const newBuffer = buffer.slice(0);
        this.audioBuffer$ = from(audioContext.then(ctx => {
            try {
                return ctx.decodeAudioData(buffer);
            } catch(e) {
                console.error(e);
                throw e;
            }
        }));
        this.blob = new Blob([newBuffer], {type: 'audio/wav'});
        this.url = URL.createObjectURL(this.blob);
        this.el = new Audio("data:audio/wav;base64," + encode(newBuffer));
        this.duration$ = this.audioBuffer$.pipe(map(b => b.duration));
        this.graphData$ = this.audioBuffer$.pipe(map(b => normalizeData(filterData(b, AUDIO_GRAPH_SAMPLE_SIZE))));

        this.graphObservable$ = this.graphData$.pipe(
            withLatestFrom(this.audioBuffer$, this.duration$), map(([graphData, audioBuffer, duration]) => {
                const updateInterval = 250;
                const chunkSize = (graphData.length) / (duration / updateInterval);
                const chunks = chunk(graphData, chunkSize);
                return from(chunks).pipe(
                    concatMap(chunk => of(chunk).pipe(delay(updateInterval)))
                )
            }))
    }
}