import {combineLatest, ReplaySubject, Subject} from "rxjs";
import {flatMap, take, withLatestFrom} from "rxjs/operators";
import {RecordRequest} from "../Interfaces/RecordRequest";
import {sleep} from "../Util/Util";
import {AudioSource} from "./AudioSource";

export class AudioRecorder {
    public recordRequest$ = new ReplaySubject<RecordRequest>(1);
    private startRecording$ = new Subject<void>();
    private countdown$ = new ReplaySubject<number>(1);
    private speechRecongitionText$ = new ReplaySubject<string>(1);

    public get isRecording$() {
        return this.audioSource.isRecording$
    }

    constructor(public audioSource: AudioSource) {
        this.recordRequest$.subscribe(async (request) => {
            const nextText = this.audioSource.recognizedText$.pipe(take(1)).toPromise();
            const nextRequest = this.recordRequest$.pipe(take(1)).toPromise();
            // await this.countdown(1000);
            this.audioSource.beginRecordingSignal.next();
            const result = Promise.race([nextText, nextRequest]);
            if (typeof result === 'object') {
                request.rejectSentence(new Error("Audio recording not completed"))
            } else {
                request.resolveSentence(result);
            }
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
}


