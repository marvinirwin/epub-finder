import {race, Subject} from "rxjs";
import {map, switchMap, take} from "rxjs/operators";
import {RecordRequest} from "../Interfaces/RecordRequest";
import {sleep} from "../Util/Util";
import {AudioSource} from "./AudioSource";

export class AudioRecorder {
    public recordRequest$ = new Subject<RecordRequest>();
    private countdown$ = new Subject<number>();

    public get isRecording$() {
        return this.audioSource.isRecording$
    }

    constructor(public audioSource: AudioSource) {
        this.recordRequest$.pipe(
            switchMap((request: RecordRequest) => {
                this.audioSource.beginRecordingSignal$.next();
                this.isRecording$.next(true);
                request.recording$.next(true);
                return race(
                    this.audioSource.recognizedText$.pipe(take(1)),
                    this.recordRequest$.pipe(take(1))
                ).pipe(
                    map((result: string | RecordRequest) => {
                        this.isRecording$.next(false);
                        let resultArray: [string | RecordRequest, RecordRequest] = [result, request];
                        return resultArray;
                    })
                );
            })
        ).subscribe(async ([result, request]: [string | RecordRequest, RecordRequest]) => {
            request.recording$.next(false);
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


