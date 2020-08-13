import {combineLatest, from, Observable, ReplaySubject, Subject} from "rxjs";
import {
    concatMap,
    count,
    flatMap,
    map,
    mergeMap,
    shareReplay,
    startWith,
    switchMap,
    take, tap,
    withLatestFrom
} from "rxjs/operators";
import React from "react";
import axios from "axios";
import {WavAudio} from "./WavAudio";
import {RecordRequest} from "./Interfaces/RecordRequest";
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
    quedRecordRequest$ = new Subject<RecordRequest>();
    currentRecordRequest$ = new ReplaySubject<RecordRequest>(1);
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
        this.isRecording$.next(false);
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
            ),
            shareReplay(1)
        )
        this.mediaSource$ = from(navigator.mediaDevices.getUserMedia({audio: true}))
            .pipe(
                shareReplay(1)
            );

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
/*
            const draw = () => {
                this.drawSineWave(canvas, draw, analyser, dataArray, canvasCtx, bufferLength);
            }
*/
/*
            draw();
*/
        })
        this.quedRecordRequest$
            .pipe(withLatestFrom(this.isRecording$))
            .subscribe(([newRequest, isRecording]) => {
                if (!isRecording) this.currentRecordRequest$.next(newRequest);
            })

        this.currentRecordRequest$.pipe(
            withLatestFrom(this.mediaSource$, this.canvas$, this.speechConfig$),
            flatMap(([req, source, canvas, speechConfig]: [RecordRequest, MediaStream, HTMLCanvasElement, SpeechConfig]) => {
                return new Promise(async resolve => {
                    await this.countdown(req.duration + 1500);
                    this.isRecording$.next(true);
                    const audioConfig = AudioConfig.fromMicrophoneInput(source.id);
                    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

                    const close = () => {
                        this.isRecording$.next(false)
                        try {
                            recognizer.close();
                            audioConfig.close();
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    this.quedRecordRequest$.pipe(take(1)).subscribe(r => {
                        close()
                        this.currentRecordRequest$.next(r);
                    })
                    this.speechRecongitionText$.next('');
                    recognizer.recognizeOnceAsync(
                        (result) => {
                            this.speechRecongitionText$.next(result.text)
                            debugger;
                            req.cb(result.text);
                            close()
                            resolve();
                        },
                        (err) => {
                            console.error(err);
                            close()
                            resolve();
                        });
                });
            })
        ).subscribe(() => {
        })
    }

    private async countdown(duration: number) {
        let countdownIncrement = 500;
        let countdownStart = Math.floor((duration + countdownIncrement) / (countdownIncrement));
        for (let i = 0; i <= countdownStart; i++) {
            this.countdown$.next(countdownStart - i);
            await sleep(countdownIncrement)
        }
    }

    private drawSineWave(canvas: HTMLCanvasElement, draw: () => void, analyser: AnalyserNode, dataArray: Uint8Array, canvasCtx: CanvasRenderingContext2D, bufferLength: number) {
        return;
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

    getRecording(text: string, duration: number): Promise<string> {
        return new Promise(resolve => {
            try {
                this.quedRecordRequest$.next({
                    label: text,
                    cb: resolve,
                    duration
                })
            } catch (e) {
                console.error(e);
            }
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


