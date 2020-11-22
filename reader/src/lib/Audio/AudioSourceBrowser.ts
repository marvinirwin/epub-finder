import {Observable, ReplaySubject, Subject} from "rxjs";
import {
    AudioConfig,
    SpeechConfig,
    SpeechRecognizer
} from "microsoft-cognitiveservices-speech-sdk";
import {flatMap, map, shareReplay, withLatestFrom} from "rxjs/operators";
import axios from "axios";
import {AudioSource} from "./AudioSource";

const AZURE_SPEECH_REGION = 'westus2' as string;

export class AudioSourceBrowser implements AudioSource {
    public isRecording$ = new ReplaySubject<boolean>(1);
    public beginRecordingSignal$ = new Subject<void>();
    public stopRecordingSignal$ = new Subject<void>();
    public recognizedText$ = new Subject<string>();
    public mostRecentRecognizedText$: Observable<string>;
    public error$ = new ReplaySubject<string>(1)

    private speechRecognitionToken$ = new ReplaySubject<string>(1);
    private speechConfig$: Observable<SpeechConfig>;
    private mediaSource$: Observable<MediaStream>;
    private audioConfig$: Observable<AudioConfig>;
    private mediaDevices = new ReplaySubject<MediaDevices>(1)

    constructor() {
        this.mostRecentRecognizedText$ = this.recognizedText$.pipe(shareReplay(1));
        if (navigator.mediaDevices) {
            this.mediaDevices.next(navigator.mediaDevices);
        } else {
            this.error$.next(`navigator.mediaDevices not found, cannot use microphone`)
        }

        this.mediaSource$ = this.mediaDevices.pipe(
            flatMap(mediaDevices => {
                try {
                    return mediaDevices.getUserMedia({audio: true});
                } catch (e) {
                    this.error$.next(e);
                    this.error$.next(`Failed to get Microphone information`);
                    throw e;
                }
            }),
            shareReplay(1)
        );
        this.speechConfig$ = this.speechRecognitionToken$.pipe(
            map(t => {
                    try {
                        const speechConfig = SpeechConfig.fromAuthorizationToken(t, AZURE_SPEECH_REGION);
                        speechConfig.speechRecognitionLanguage = "zh-CN";
                        return speechConfig;
                    } catch (e) {
                        this.error$.next(e);
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
                } catch (e) {
                    this.error$.next(e);
                    throw e;
                }
            }),
            shareReplay(1)
        );

        this.beginRecordingSignal$.pipe(
            withLatestFrom(this.speechConfig$)
        ).subscribe(async ([, speechConfig]) => {
            const audioConfig = AudioConfig.fromMicrophoneInput(navigator.mediaDevices.getUserMedia({audio: true}));
            const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
            recognizer.recognizeOnceAsync(
                result => {
                    // One of the reasons text would be undefined is initialSilenceTimeout
                    this.recognizedText$.next(result.text || '');
                    this.isRecording$.next(false);
                },
                err => {
                    // I assume this only happens when a new recording request happens
                    this.recognizedText$.next(err)
                    this.isRecording$.next(false);
                }
            )
        });

        this.loadToken();
    }

    private loadToken() {
        axios.post(`${process.env.PUBLIC_URL}/speech-recognition-token`).then(result =>
            this.speechRecognitionToken$.next(result.data as string)
        );
    }
}