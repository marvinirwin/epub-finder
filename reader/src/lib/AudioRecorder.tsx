import {from, Observable, of, ReplaySubject, Subject} from "rxjs";
import {concatMap, delay, filter, flatMap, map, shareReplay, switchMap, withLatestFrom} from "rxjs/operators";
import React, {useEffect, useState} from "react";
import Plot from 'react-plotly.js';
import {chunk} from "lodash";
import axios from "axios";
import {encode} from "base64-arraybuffer";
import {useObs} from "../UseObs";




class WavAudio {
    blob: Blob;
    url: string;
    el: HTMLAudioElement;
    duration: number;
    audioBuffer$: Observable<AudioBuffer>;
    graphData$: Observable<number[]>;
    private graphObservable$: Observable<Observable<number[]>>;

    constructor(public buffer: ArrayBuffer, public audioBuffer: AudioBuffer, public base64: string) {
        this.blob = new Blob([buffer], {type: 'audio/wav'});
        this.url = URL.createObjectURL(this.blob);
        this.el = new Audio("data:audio/wav;base64," + base64);
        this.duration = this.audioBuffer.duration;
        this.audioBuffer$ = of(audioBuffer);
        this.graphData$ = this.audioBuffer$.pipe(map(b => normalizeData(filterData(b, AUDIO_GRAPH_SAMPLE_SIZE))));

        this.graphObservable$ = this.graphData$.pipe(
            withLatestFrom(this.audioBuffer$), map(([graphData, audioBuffer]) => {
                const updateInterval = 250;
                const duration = this.duration;
                const chunkSize = (graphData.length) / (duration / updateInterval);
                const chunks = chunk(graphData, chunkSize);
                return from(chunks).pipe(
                    concatMap(chunk => of(chunk).pipe(delay(updateInterval)))
                )
            }))
    }
}

async function workingAudioData(b: ArrayBuffer): Promise<AudioBuffer> {
    try {
        return await audioContext.decodeAudioData(b)
    } catch (e) {
        console.log("Error decoding synthesized sound")
        console.error(e);
        throw e;
    }
}

const audioContext = new AudioContext();
const AUDIO_GRAPH_SAMPLE_SIZE = 50;
const filterData = (audioBuffer: AudioBuffer, samples: number) => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]) // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
}

const normalizeData = (filteredData: number[]) => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

export interface RecordRequest {
    length: number;
    cb: (c: WavAudio) => void;
}

export class AudioRecorder {
    finishedRecordingData = new Subject<Blob>()
    /*
        audioChunks$: Observable<AudioBuffer>;
        graphDataChunks$: Observable<number[]>;
    */
    recordRequest$ = new Subject<RecordRequest>();
    graphData$: Observable<number[]>;
    mediaSource$: Observable <MediaStream>;
    stream$: Observable<MediaStreamAudioSourceNode>;
    canvas$ = new Subject<HTMLCanvasElement>();

    constructor() {
        this.mediaSource$ = from(navigator.mediaDevices.getUserMedia({audio: true}));

        /*
                this.audioChunks$ = this.blobs$.pipe(
                    flatMap(blob => new Response(blob).arrayBuffer()),
                    flatMap(buffer => audioContext.decodeAudioData(buffer))
                )
                this.graphDataChunks$ = this.audioChunks$.pipe(
                    map(chunk => filterData(chunk, 50)),
                    map(chunk => normalizeData(chunk)),
                )
        */
        // @ts-ignore
        this.recordRequest$.pipe(
            withLatestFrom(this.mediaSource$, this.canvas$),
            flatMap(([req, source, canvas]: [RecordRequest, MediaStream, HTMLCanvasElement]) => {
                const canvasCtx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
                const recorder = new MediaRecorder(source);
                const stream = audioContext.createMediaStreamSource(recorder.stream);
                return new Promise(async resolve => {
                    recorder.ondataavailable = (event) => {
                        resolve(event.data);
                    }
                    const analyser = audioContext.createAnalyser();
                    analyser.fftSize = 2048;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);
                    stream.connect(analyser).connect(audioContext.destination);

                    const draw = () => {
                        const WIDTH = canvas.width
                        const HEIGHT = canvas.height;

                        requestAnimationFrame(draw);

                        analyser.getByteTimeDomainData(dataArray);

                        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                        canvasCtx.lineWidth = 2;
                        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

                        canvasCtx.beginPath();

                        let sliceWidth = WIDTH * 1.0 / bufferLength;
                        let x = 0;


                        for (let i = 0; i < bufferLength; i++) {

                            let v = dataArray[i] / 128.0;
                            let y = v * HEIGHT / 2;

                            if (i === 0) {
                                canvasCtx.moveTo(x, y);
                            } else {
                                canvasCtx.lineTo(x, y);
                            }

                            x += sliceWidth;
                        }

                        canvasCtx.lineTo(canvas.width, canvas.height / 2);
                        canvasCtx.stroke();

                    }

                    draw();
                    recorder.start();

                    setTimeout(() => recorder.stop(), length)
                })
            })
        )
        this.graphData$ = this.finishedRecordingData.pipe(
            flatMap(async (recordingData: Blob) => {
                const blob = new Blob([recordingData], {type: 'audio/wav'})
                const buffer = await (new Response(blob)).arrayBuffer();
                const wav = new WavAudio(buffer, await audioContext.decodeAudioData(buffer), encode(buffer))
                try {
                    return await audioContext.decodeAudioData(buffer)
                } catch (e) {
                    console.log("Error decoding user audio")
                    console.error(e);
                }
                return;
            }),
            filter(v => !!v),
            map(d => {
                // @ts-ignore
                return normalizeData(filterData(d, AUDIO_GRAPH_SAMPLE_SIZE));
            })
        )
        this.recordRequest$.subscribe(r => {
            this.rec(r.length).then()
        })
    }

    rec(length: number) {
        return new Promise(async (resolve) => {
        })
    }
}

const globalRecorder = new AudioRecorder();

function spaceOutRecording() {

}

async function getAudioDuration(wavBuffer: ArrayBuffer): Promise<number> {
    const blob = new Blob([wavBuffer], {type: 'audio/wav'});
    const url = URL.createObjectURL(blob); // Is this how I create a url for a blob?
    // What about response?
    /*
        const url: string = (new Response(blob)).url;
    */
    var snd = new Audio(url);
    return snd.duration;
}

export class AudioTest {
    text$ = new ReplaySubject<string>(1);
    synthesizedAudio$: Observable<WavAudio>;
    userAudioNumbers$: Observable<number[]>;
    synthesizedGraphData$: Observable<number[]>

    constructor() {
        this.synthesizedAudio$ = this.text$.pipe(
            flatMap(async text => {
                const response = await axios.post('/get-speech', {text: '你们好'}, {responseType: 'blob'});
                const b = new Blob(response.data, {type: 'audio/wav'})
                const buffer = await (new Response(b).arrayBuffer())
                return new WavAudio(buffer, await workingAudioData(buffer), encode(buffer));
            }),
            shareReplay(1)
        );
        this.synthesizedAudio$.subscribe(v => v.el.play())
        this.userAudioNumbers$ = this.synthesizedAudio$.pipe(
            switchMap(
                (wav: WavAudio) => {
                    const rec = new AudioRecorder();
                    rec.rec(wav.duration * 1000 * 2)
                    return rec.graphData$
                }
            ),
            shareReplay(1)
        );
        this.synthesizedGraphData$ = this.synthesizedAudio$.pipe(
            switchMap(v => v.graphData$)
        )
    }

}

export function AudioRecording({t}: { t: AudioTest }) {
    const userNumbers = useObs(t.userAudioNumbers$);
    const synthesizeNumbers = useObs(t.synthesizedGraphData$);
    const [rev, setRev] = useState(0);
    useEffect(() => {
            setRev(rev + 1)
        },
        [userNumbers, synthesizeNumbers])
    return <div>
        <Plot data={
            [userNumbers || [], synthesizeNumbers || []].map((stream, i) => {
                return {
                    x: stream.map((_, i) => i + 1),
                    y: stream,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: {color: ['red', 'green']},
                }
            })
        } layout={{width: 320, height: 240, title: 'Sound recording'}}
              revision={rev}
        />
    </div>
}