import {combineLatest, from, Observable, ReplaySubject, Subject} from "rxjs";
import {concatMap, flatMap, map, mergeMap, shareReplay, switchMap, withLatestFrom} from "rxjs/operators";
import React from "react";
import axios from "axios";
import {WavAudio} from "./WavAudio";
import {IRecordRequest} from "./Interfaces/IRecordRequest";
import {AudioConfig, SpeechConfig, SpeechRecognizer} from "microsoft-cognitiveservices-speech-sdk";
import assert from "assert";
import {sleep} from "./Util/Util";

// TODO does this work?
let AZURE_SPEECH_REGION = 'westus2' as string;

assert(AZURE_SPEECH_REGION);


export const audioContext = new Promise<AudioContext>(resolve => {
    setTimeout(() => {
        resolve(new AudioContext())
    }, 1000)
})

export const AUDIO_GRAPH_SAMPLE_SIZE = 50;

export const filterData = (audioBuffer: AudioBuffer, samples: number) => {
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

export const normalizeData = (filteredData: number[]) => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

export class AudioRecorder {
    recordRequest$ = new ReplaySubject<IRecordRequest>(1);
    mediaSource$: Observable<MediaStream>;
    canvas$ = new ReplaySubject<HTMLCanvasElement>(1);
    isRecording$ = new ReplaySubject<boolean>(1);
/*
    userAudio$: Observable<WavAudio | undefined>;
*/
    countdown$ = new ReplaySubject<number>(1);
    speechRecognitionToken$ = new ReplaySubject<string>(1);
    speechConfig$: Observable<SpeechConfig>;
    speechRecongitionText$ = new ReplaySubject<string>(1);


    constructor() {
        axios.post(`/speech-recognition-token`).then(result => {
            const token = result.data as string;
            this.speechRecognitionToken$.next(token);
        })

        this.speechConfig$ = this.speechRecognitionToken$.pipe(
            map(t => {
                    const speechConfig = SpeechConfig.fromAuthorizationToken(t, AZURE_SPEECH_REGION);
                    speechConfig.speechRecognitionLanguage = "zh-CN";
                    return speechConfig;
                }
            )
        )
        this.mediaSource$ = from(navigator.mediaDevices.getUserMedia({audio: true}));

        combineLatest([this.mediaSource$, this.canvas$]).subscribe(async ([source, canvas]) => {
            const canvasCtx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
            const recorder = new MediaRecorder(source);
            const stream = (await audioContext).createMediaStreamSource(recorder.stream);
            const analyser = (await audioContext).createAnalyser();
            analyser.fftSize = 2048
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            // Dont connect back to speakers
            stream.connect(analyser)
            const draw = () => {
                this.drawSineWave(canvas, draw, analyser, dataArray, canvasCtx, bufferLength);
            }
            draw();
        })

        /*this.userAudio$ = */this.recordRequest$.pipe(
            withLatestFrom(this.mediaSource$, this.canvas$, this.speechConfig$),
            flatMap(async args => {
                for (let i = 0; i <= 3; i++) {
                    this.countdown$.next(3 - i);
                    await sleep(500)
                }
                return args;
            }, 1),
            flatMap(async ([req, source, canvas, speechConfig]: [IRecordRequest, MediaStream, HTMLCanvasElement, SpeechConfig]) => {
                this.isRecording$.next(true);
                const audioConfig = AudioConfig.fromMicrophoneInput(source.id);
                const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
                this.speechRecongitionText$.next('');
                recognizer.recognizeOnceAsync(
                    (result) => {
                        this.speechRecongitionText$.next(result.text)
                        this.isRecording$.next(false);
                        recognizer.close();
                    },
                    function (err) {
                        console.error(err);
                        recognizer.close();
                    });
            })
        ).subscribe(() => {})
    }

    private drawSineWave(canvas: HTMLCanvasElement, draw: () => void, analyser: AnalyserNode, dataArray: Uint8Array, canvasCtx: CanvasRenderingContext2D, bufferLength: number) {
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

    getRecording(text: string, duration: number): Promise<WavAudio> {
        return new Promise(resolve => {
            this.recordRequest$.next({
                label: text,
                cb: resolve,
                duration
            })
        })
    }
}

export async function getSynthesizedAudio(text: string): Promise<WavAudio> {
    const response = await axios.post('/get-speech', {text}, {responseType: 'blob'});
    const buffer = await new Response(response.data as Blob).arrayBuffer()
    /*
        const b = new Blob([response.data as Blob], {type: 'audio/wav'})
        const buffer =
    */
    return new WavAudio(buffer);
}

export class AudioTest {
    text$ = new ReplaySubject<string>(1);
    synthesizedAudio$: Observable<WavAudio>;
    synthesizedGraphData$: Observable<number[]>

    constructor() {
        this.synthesizedAudio$ = this.text$.pipe(
            flatMap(async text => {
                return await getSynthesizedAudio(text);
            }),
            shareReplay(1)
        );
        /*
                this.synthesizedAudio$.subscribe(v => v.el.play())
                this.userAudioNumbers$ = this.synthesizedAudio$.pipe(
                    switchMap(
                        (wav: WavAudio) => {
                            const rec = new AudioRecorder();
                            rec.rec(wav.duration$ * 1000 * 2)
                            return rec.graphData$
                        }
                    ),
                    shareReplay(1)
                );
        */
        this.synthesizedGraphData$ = this.synthesizedAudio$.pipe(
            switchMap(v => v.graphData$)
        )
    }

}

