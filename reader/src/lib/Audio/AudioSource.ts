import {Observable, ReplaySubject, Subject} from "rxjs";

export interface AudioSource {
    isRecording$: ReplaySubject<boolean>;
    beginRecordingSignal$: Subject<void>;
    stopRecordingSignal$: Subject<void>;
    recognizedText$: Observable<string>;
    mostRecentRecognizedText$: Observable<string>;
}