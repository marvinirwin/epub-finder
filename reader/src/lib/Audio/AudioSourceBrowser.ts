import {combineLatest, from, Observable, ReplaySubject, Subject} from "rxjs";
import {AudioConfig, ResultReason, SpeechConfig, SpeechRecognizer} from "microsoft-cognitiveservices-speech-sdk";
import {map, shareReplay, take, tap, withLatestFrom} from "rxjs/operators";
import axios from "axios";
import {AudioSource} from "./AudioSource";
import {sleep} from "../Util/Util";

let AZURE_SPEECH_REGION = 'westus2' as string;

export class AudioSourceBrowser implements AudioSource {
    public isRecording$ = new ReplaySubject<boolean>(1);
    public beginRecordingSignal$ = new Subject<void>();
    public stopRecordingSignal$ = new Subject<void>();
    public recognizedText$ = new ReplaySubject<string>(1);

    private speechRecognitionToken$ = new ReplaySubject<string>(1);
    private speechConfig$: Observable<SpeechConfig>;
    private mediaSource$: Observable<MediaStream>;
    private audioConfig$: Observable<AudioConfig>;
    private recognizer: SpeechRecognizer | undefined;
    private recognizing: boolean = false;
    recognizer$: Observable<SpeechRecognizer>;


    constructor() {
        this.mediaSource$ = from(navigator.mediaDevices.getUserMedia({audio: true})).pipe(shareReplay(1));
        this.speechConfig$ = this.speechRecognitionToken$.pipe(
            map(t => {
                    try {
                        const speechConfig = SpeechConfig.fromAuthorizationToken(t, AZURE_SPEECH_REGION);
                        speechConfig.speechRecognitionLanguage = "zh-CN";
                        return speechConfig;
                    } catch (e) {
                        console.error(e);
                        throw e;
                    }
                }
            ),
            shareReplay(1)
        );

        this.audioConfig$ = this.mediaSource$.pipe(
            map(mediaSource => {
                try {
                    return AudioConfig.fromMicrophoneInput(mediaSource.id);
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            }),
            shareReplay(1)
        );
        this.recognizer$ = combineLatest([this.audioConfig$, this.speechConfig$]).pipe(
            map(([audio, speech]) => {
                return this.getNewRecognizer(speech, audio);
            }),
            shareReplay(1)
        )

        this.beginRecordingSignal$.pipe(
            withLatestFrom(this.recognizer$)
        ).subscribe(([, recognizer]) => {
            return new Promise((resolve, reject) => {
                if (!this.recognizing) {
                    this.recognizer?.startContinuousRecognitionAsync();
                }
            })
        });

        this.loadToken();
    }


    private getNewRecognizer(speechConfig: SpeechConfig, audioConfig: AudioConfig): SpeechRecognizer {
        this.recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        this.recognizer.recognized = (s, e) => {
            if (e.result.reason == ResultReason.RecognizedSpeech) {
                this.recognizedText$.next(e.result.text)
                this.recognizer?.stopContinuousRecognitionAsync();
                this.recognizing = false;
            }
        };
        this.recognizing = true;
        this.recognizer.startContinuousRecognitionAsync(
            this.getRecognizerCB(),
            this.getRecognizerError()
        );
        // Start continuous speech recognition
        return this.recognizer;
    }

    private getRecognizerError() {
        return (error: string) => {
            console.error(error);
            this.isRecording$.next(false);
        };
    }

    private getRecognizerCB() {
        return () => {
            this.isRecording$.next(true);
            this.recognizedText$.pipe(take(2)).toPromise().then(() => {
                this.isRecording$.next(false);
            });
        };
    }

    private loadToken() {
        axios.post(`${process.env.PUBLIC_URL}/speech-recognition-token`).then(result =>
            this.speechRecognitionToken$.next(result.data as string)
        );
    }
}