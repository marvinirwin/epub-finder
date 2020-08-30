import {from, Observable, ReplaySubject, Subject} from "rxjs";
import {AudioConfig, SpeechConfig, SpeechRecognizer} from "microsoft-cognitiveservices-speech-sdk";
import {map, shareReplay, tap, withLatestFrom} from "rxjs/operators";
import axios from "axios";
import {AudioSource} from "./AudioSource";
import {sleep} from "../Util/Util";

let AZURE_SPEECH_REGION = 'westus2' as string;

export class AudioSourceBrowser implements AudioSource{
    public isRecording$ = new ReplaySubject<boolean>(1);
    public beginRecordingSignal$ = new Subject<void>();
    public stopRecordingSignal$ = new Subject<void>();
    public recognizedText$ = new ReplaySubject<string>(1);

    private speechRecognitionToken$ = new ReplaySubject<string>(1);
    private speechConfig$: Observable<SpeechConfig>;
    private mediaSource$: Observable<MediaStream>;
    private audioConfig$: Observable<AudioConfig>;
    private recognizer: SpeechRecognizer | undefined;

    constructor() {
        this.mediaSource$ = from(navigator.mediaDevices.getUserMedia({audio: true})).pipe(shareReplay(1));
        this.speechConfig$ = this.speechRecognitionToken$.pipe(
            map(t => {
                try {
                    const speechConfig = SpeechConfig.fromAuthorizationToken(t, AZURE_SPEECH_REGION);
                    speechConfig.speechRecognitionLanguage = "zh-CN";
                    return speechConfig;
                } catch(e) {
                    console.error(e);
                    throw e;
                }
                }
            ),
            shareReplay(1)
        );

        this.audioConfig$ = this.mediaSource$.pipe(map(mediaSource => {
            try {
                return AudioConfig.fromMicrophoneInput(mediaSource.id);
            } catch(e) {
                console.error(e);
                throw e;
            }
        }));

        this.beginRecordingSignal$.pipe(
            withLatestFrom(this.audioConfig$, this.speechConfig$)
        ).subscribe(async ([_, audioConfig, speechConfig]) => {
            this.isRecording$.next(true);
            try {
                (await this.getNewRecognizer(speechConfig, audioConfig)).recognizeOnceAsync(
                    (result) => {
                        this.isRecording$.next(false);
                        this.recognizedText$.next(result.text);
                    },
                    (err) => {
                        debugger;
                        this.isRecording$.next(false);
                        console.error(err);
                    });
            } catch(e) {
                debugger;
                console.error(e);
            }
        });

        this.stopRecordingSignal$.subscribe(() => {
            this.cancelRecognizer();
        });
        this.loadToken();
    }


    private async getNewRecognizer(speechConfig: SpeechConfig, audioConfig: AudioConfig): Promise<SpeechRecognizer> {
        if (this.recognizer) {
            // In the old method I closed the audioConfig, do I need to close it this time?
            this.cancelRecognizer();

        }
        await sleep(1000);
        this.recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        return this.recognizer;
    }

    private cancelRecognizer() {
        try {
            this.recognizer?.close();
        } catch (e) {
            console.warn(e);
        }
    }

    private loadToken() {
        axios.post(`${process.env.PUBLIC_URL}/speech-recognition-token`).then(result =>
            this.speechRecognitionToken$.next(result.data as string)
        );
    }
}