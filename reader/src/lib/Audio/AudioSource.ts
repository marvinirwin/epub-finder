import {Observable, ReplaySubject, Subject} from "rxjs";

export interface AudioSource {
    isRecording$: ReplaySubject<boolean>;
    beginRecordingSignal$: Subject<void>;
    stopRecordingSignal$: Subject<void>;
    recognizedText$: Observable<string>;
    mostRecentRecognizedText$: Observable<string>;
    errors$: Observable<string>;
    microphone$: Observable<MediaStream>
    learningToKnownSpeech$: ReplaySubject<string | undefined>;
}