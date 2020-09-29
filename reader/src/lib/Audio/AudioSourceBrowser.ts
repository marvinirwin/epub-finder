import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {
    AudioConfig, CancellationDetails, NoMatchDetails,
    NoMatchReason,
    ResultReason,
    SpeechConfig,
    SpeechRecognizer
} from "microsoft-cognitiveservices-speech-sdk";
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
    private recognizerStarted: boolean = false;
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
        ).subscribe(async ([, recognizer]) => {
            if (this.recognizerStarted) {
                await new Promise(resolve => {
                    this.recognizer?.stopContinuousRecognitionAsync(resolve, err => {
                        this.error$.next(err);
                        resolve();
                    });
                });
            }
            this.startRecognition();

        });

        this.loadToken();
    }

    private getNewRecognizer(speechConfig: SpeechConfig, audioConfig: AudioConfig): SpeechRecognizer {
        this.recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        this.recognizer.recognized = (s, e) => {
            switch (e.result.reason) {
                case ResultReason.NoMatch:
                    const noMatchDetails = NoMatchDetails.fromResult(e.result);
                    this.error$.next(JSON.stringify(noMatchDetails))
                    break;
                case ResultReason.Canceled:
                    const cancellationDetails = CancellationDetails.fromResult(e.result);
                    this.error$.next(JSON.stringify(cancellationDetails))
                    break;
                case ResultReason.RecognizingSpeech:
                    break;
                case ResultReason.RecognizedSpeech:
                    this.recognizedText$.next(e.result.text);
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
        this.startRecognition();
        // Start continuous speech recognition
        return this.recognizer;
    }

    private startRecognition() {
        this.recognizer?.startContinuousRecognitionAsync(
            () => {
                this.recognizerStarted = true;
                this.isRecording$.next(true);
            },
            (error: string) => {
                this.recognizerStarted = false;
                console.error(error);
                this.error$.next(error);
                this.isRecording$.next(false);
            }
        );
    }

    private loadToken() {
        axios.post(`${process.env.PUBLIC_URL}/speech-recognition-token`).then(result =>
            this.speechRecognitionToken$.next(result.data as string)
        );
    }
}