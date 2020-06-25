import {from, Observable, of, ReplaySubject, Subject} from "rxjs";
import {concatMap, delay, filter, flatMap, map, scan, shareReplay, switchMap, withLatestFrom} from "rxjs/operators";
import React, {useEffect, useState} from "react";
import Plot from 'react-plotly.js';
import {chunk} from "lodash";
import axios, {AxiosResponse} from "axios";
import {decode} from "base64-arraybuffer";
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


async function workingAudioData(data: string): Promise<AudioBuffer> {
    const SynthesizedDecodedWavFile = decode(data);
    try {
        return await audioContext.decodeAudioData(SynthesizedDecodedWavFile)
    } catch(e) {
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

export class AudioRecorder {
    recordingData$ = new Subject<Blob>()
    /*
        audioChunks$: Observable<AudioBuffer>;
        graphDataChunks$: Observable<number[]>;
    */
    allGraphData$: Observable<number[]>

    constructor() {
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
        this.allGraphData$ = this.recordingData$.pipe(
            scan((acc: Blob[], audioDataChunk) => {
                acc.push(audioDataChunk);
                return acc;
            }, []),
            flatMap(async (recordingData: Blob[]) => {
                console.log(recordingData);
                const blob = new Blob(recordingData, {type: 'audio/wav'})
                const buffer = await (new Response(blob)).arrayBuffer();
                try {
                    return await audioContext.decodeAudioData(buffer)
                } catch(e) {
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
    }

    async rec(length: number) {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener("dataavailable", event => {
            console.log(event.data);
            console.log(event);
            if (event.data.size) {
                this.recordingData$.next(event.data)
            }
        });
        mediaRecorder.start();

        setTimeout(() => mediaRecorder.stop(), length)
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
                const result = await axios.post('/get-speech', {text: '你们好'});
                return new WavAudio(decode(result.data), await workingAudioData(result.data), result.data);
            }),
            shareReplay(1)
        );
        this.synthesizedAudio$.subscribe(v => v.el.play())
        this.userAudioNumbers$ = this.synthesizedAudio$.pipe(
            switchMap(
                (wav: WavAudio) => {
                    const rec = new AudioRecorder();
                    rec.rec(wav.duration * 1000 * 2)
                    return rec.allGraphData$
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