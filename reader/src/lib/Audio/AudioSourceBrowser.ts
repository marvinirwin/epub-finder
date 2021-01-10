import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {
    AudioConfig,
    SpeechConfig,
    SpeechRecognizer
} from "microsoft-cognitiveservices-speech-sdk";
import {filter, flatMap, map, shareReplay, withLatestFrom} from "rxjs/operators";
import {AudioSource} from "./AudioSource";
import {SpeechRecognitionConfigService} from "./speech-recognition-config.service";


export class AudioSourceBrowser implements AudioSource {
    public isRecording$ = new ReplaySubject<boolean>(1);
    public beginRecordingSignal$ = new Subject<void>();
    public stopRecordingSignal$ = new Subject<void>();
    public recognizedText$ = new Subject<string>();
    public mostRecentRecognizedText$: Observable<string>;
    public errors$ = new ReplaySubject<string>(1)
    public microphone$ = new ReplaySubject<MediaStream>(1);
    private speechRecognitionConfigService = new SpeechRecognitionConfigService();

    constructor() {
        this.mostRecentRecognizedText$ = this.recognizedText$.pipe(shareReplay(1));
        if (navigator.mediaDevices) {
        } else {
            this.errors$.next(`navigator.mediaDevices not found, cannot use microphone`)
        }

/*
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
*/

        this.beginRecordingSignal$.subscribe(async () => {
            const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
            this.microphone$.next(mediaStream);
            const audioConfig = AudioConfig.fromMicrophoneInput(mediaStream.id);
            const recognizer = new SpeechRecognizer(await this.speechRecognitionConfigService.config.get(), audioConfig);
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
    }
}