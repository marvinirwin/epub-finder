import {from, Observable, ReplaySubject, Subject} from "rxjs";
import {AudioConfig, SpeechConfig, SpeechRecognizer} from "microsoft-cognitiveservices-speech-sdk";
import {map, shareReplay, withLatestFrom} from "rxjs/operators";
import axios from "axios";

let AZURE_SPEECH_REGION = 'westus2' as string;

export class BrowserAudio {
    public isRecording$ = new ReplaySubject<boolean>(1);
    public beginRecordingSignal = new Subject<void>();
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
                    const speechConfig = SpeechConfig.fromAuthorizationToken(t, AZURE_SPEECH_REGION);
                    speechConfig.speechRecognitionLanguage = "zh-CN";
                    return speechConfig;
                }
            ),
            shareReplay(1)
        );

        this.audioConfig$ = this.mediaSource$.pipe(map(mediaSource => AudioConfig.fromMicrophoneInput(mediaSource.id)));

        this.beginRecordingSignal.pipe(
            withLatestFrom(this.audioConfig$, this.speechConfig$)
        ).subscribe(([_, audioConfig, speechConfig]) => {
            this.isRecording$.next(true);
            this.getNewRecognizer(speechConfig, audioConfig).recognizeOnceAsync(
                (result) => {
                    this.isRecording$.next(false);
                    this.recognizedText$.next(result.text);
                },
                (err) => {
                    this.isRecording$.next(false);
                    console.error(err);
                });
        });

        this.stopRecordingSignal$.subscribe(() => {
            this.cancelRecognizer();
        });
        this.loadToken();
    }

    private loadToken() {
        axios.post(`/speech-recognition-token`).then(result =>
            this.speechRecognitionToken$.next(result.data as string)
        );
    }

    private getNewRecognizer(speechConfig: SpeechConfig, audioConfig: AudioConfig): SpeechRecognizer {
        if (this.recognizer) {
            // In the old method I closed the audioConfig, do I need to close it this time?
            this.cancelRecognizer();
        }
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
}