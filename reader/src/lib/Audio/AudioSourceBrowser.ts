import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {AudioConfig, ResultReason, SpeechConfig, SpeechRecognizer} from "microsoft-cognitiveservices-speech-sdk";
import {flatMap, map, shareReplay, withLatestFrom} from "rxjs/operators";
import axios from "axios";
import {AudioSource} from "./AudioSource";

let AZURE_SPEECH_REGION = 'westus2' as string;

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
    private recognizer: SpeechRecognizer | undefined;
    private recognizing: boolean = false;
    private mediaDevices = new ReplaySubject<MediaDevices>(1)
    recognizer$: Observable<SpeechRecognizer>;


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
                    return AudioConfig.fromMicrophoneInput(mediaSource.id);
                } catch (e) {
                    this.error$.next(e);
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
                if (!this.recognizing && this.recognizer) {
                    this.recognizer.startContinuousRecognitionAsync();
                    this.recognizing = true;
                }
            })
        });

        this.loadToken();
    }


    private getNewRecognizer(speechConfig: SpeechConfig, audioConfig: AudioConfig): SpeechRecognizer {
        this.recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        this.recognizer.recognized = (s, e) => {
            switch (e.result.reason) {
                case ResultReason.NoMatch:
                    this.error$.next(`Cannot understand`)
                case ResultReason.Canceled:
                    this.recognizing = false;
                    this.recognizedText$.next('')
                    this.isRecording$.next(false);
                case ResultReason.RecognizingSpeech:
                    // We don't care abou this event type
                    break;
                case ResultReason.RecognizedSpeech:
                    this.recognizing = false;
                    this.recognizedText$.next(e.result.text)
                    this.recognizer?.stopContinuousRecognitionAsync(() => this.isRecording$.next(false));
                    break;
                case ResultReason.RecognizingIntent:
                case ResultReason.RecognizedIntent:
                case ResultReason.TranslatingSpeech:
                case ResultReason.SynthesizingAudio:
                case ResultReason.SynthesizingAudioCompleted:
                case ResultReason.TranslatedSpeech:
                case ResultReason.SynthesizingAudioStarted:
                    this.error$.next("Strange speech recognition result returned")
                    break;
            }
        };
        this.recognizer.startContinuousRecognitionAsync(
            () => {
                this.recognizing = true;
                this.isRecording$.next(true);
            },
            (error: string) => {
                console.error(error);
                this.error$.next(error);
                this.isRecording$.next(false);
            }
        );
        // Start continuous speech recognition
        return this.recognizer;
    }

    private loadToken() {
        axios.post(`${process.env.PUBLIC_URL}/speech-recognition-token`).then(result =>
            this.speechRecognitionToken$.next(result.data as string)
        );
    }
}