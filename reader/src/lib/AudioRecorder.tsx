import {from, Observable, of, ReplaySubject, Subject} from "rxjs";
import {concatMap, delay, flatMap, map, scan, switchMap} from "rxjs/operators";
import React, {useEffect, useState} from "react";
import Plot from 'react-plotly.js';
import {chunk} from "lodash";
import axios from "axios";
import {decode} from "base64-arraybuffer";
import {useObs} from "../UseObs";
import {useStylesGridListImages} from "../components/ImageScroller";

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
    blobs$ = new Subject<Blob>()
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
        this.allGraphData$ = this.blobs$.pipe(
            scan((acc: Blob[], blob) => {
                acc.push(blob);
                return acc;
            }, []),
            flatMap(blobs =>
                (new Response(new Blob(blobs, {type: 'audio/wav'})))
                    .arrayBuffer()
                    .then(b => audioContext.decodeAudioData(b))
            ),
            map(d => normalizeData(filterData(d, AUDIO_GRAPH_SAMPLE_SIZE)))
        )
    }

    async rec(length: number) {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];
        mediaRecorder.addEventListener("dataavailable", event => {
            const audioBlob = new Blob([event.data], {type: 'audio/wav'});
            this.blobs$.next(audioBlob)
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
    // const url = URL.createObjectURL(blob); // Is this how I create a url for a blob?
    // What about response?
    const url = await new Response(blob).url;
    var snd = new Audio(url);
    return snd.duration;
}

async function getNormalized(wavBuffer: ArrayBuffer): Promise<number[]> {
    const audio = await audioContext.decodeAudioData(wavBuffer);
    return filterData(audio, AUDIO_GRAPH_SAMPLE_SIZE);
}

async function getAudioGraphObservable(wavBuffer: ArrayBuffer): Promise<Observable<number[]>> {
    const updateInterval = 250;
    const duration = await getAudioDuration(wavBuffer);
    const data = await getNormalized(wavBuffer);
    const chunkSize = (data.length) / (duration / updateInterval);
    const chunks = chunk(data, chunkSize);
    return from(chunks).pipe(
        concatMap(chunk => of(chunk).pipe(delay(updateInterval)))
    )
}

export function AudioGraph({recorder, synthesized}: { recorder: AudioRecorder, synthesized: number[] }) {

}




class AudioTest {
    text$ = new ReplaySubject<string>(1);
    synthesizedArrayBuffer$: Observable<ArrayBuffer>;
    duration$: Observable<number>;
    userAudioNumbers$: Observable<number[]>;
    synthesizedAudioNumbers$: Observable<number[]>;

    constructor() {
        this.synthesizedArrayBuffer$ = this.text$.pipe(
            flatMap(async text => {
                const result = await axios.post('/get-speech', {text});
                return decode(result.data);
            }),
        );
        this.duration$ = this.synthesizedArrayBuffer$.pipe(
            flatMap(getAudioDuration)
        );
        this.userAudioNumbers$ = this.duration$.pipe(
            switchMap(
                (duration: number) => {
                    const rec = new AudioRecorder();
                    rec.rec(duration)
                    return rec.allGraphData$
                }
            )
        );
        this.synthesizedAudioNumbers$ = this.synthesizedArrayBuffer$.pipe(
            flatMap(v => getAudioGraphObservable(v)),
            switchMap(v => v)
        )

    }
}

export function AudioRecording({t}: { t: AudioTest }) {
    const userNumbers = useObs(t.userAudioNumbers$);
    const synthesizeNumbers = useObs(t.synthesizedAudioNumbers$);
    const [rev, setRev] = useState(0);
    useEffect(() => {
            setRev(rev + 1)
        },

        [userNumbers, synthesizeNumbers])
    return <Plot data={
        [userNumbers || [], synthesizeNumbers || []].map((stream, i) => {
            return {
                x: stream.map((_, i) => i + 1),
                y: stream,
                type: 'scatter',
                mode: 'lines+markers',
                marker: {color: 'red'},

            }
        })
    } layout={{width: 320, height: 240, title: 'A Fancy Plot'}}
                 revision={rev}
    />
}