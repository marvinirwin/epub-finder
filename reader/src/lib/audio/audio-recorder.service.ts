import {Observable, race, ReplaySubject, Subject} from "rxjs";
import {filter, map, shareReplay, startWith, switchMap, take, withLatestFrom} from "rxjs/operators";
import {RecordRequest} from "../Util/RecordRequest";
import {sleep} from "../Util/Util";
import {AudioSource} from "./AudioSource";
import {transliterate} from "../transliterate.service";
import {LanguageConfigsService} from "../language-configs.service";

export class AudioRecorder {
    public recordRequest$ = new Subject<RecordRequest>();
    public currentRecognizedText$ = new ReplaySubject<string>(1);
    public recentlyRecorded$ = new ReplaySubject<boolean>(1);
/*
    public currentRecognizedPinyin$: Observable<string>;
*/
    private countdown$ = new Subject<number>();
    public audioSource: AudioSource;

    public get isRecording$() {
        return this.audioSource.isRecording$
    }

    constructor({audioSource}:{audioSource: AudioSource}) {
        this.audioSource = audioSource
/*
        this.currentRecognizedPinyin$ = this.currentRecognizedText$.pipe(
            switchMap(async text => {

            }),
            shareReplay(1)
        );
*/
        this.isRecording$.subscribe(recordingNow => {
            recordingNow && this.recentlyRecorded$.next(recordingNow);
        });
        this.isRecording$.pipe(
            filter(v => !v),
            switchMap(async () => {
                await sleep(5000)
            }),
            withLatestFrom(this.isRecording$.pipe(startWith(false)))
        ).subscribe(([, isRecording]) => {
            if (!isRecording) {
                this.recentlyRecorded$.next(false);
            }
        })
        this.recordRequest$.pipe(
            switchMap((request: RecordRequest) => {
                this.audioSource.beginRecordingSignal$.next();
                this.currentRecognizedText$.next('');
                this.isRecording$.next(true);
                request.recording$.next(true);
                return race(
                    this.audioSource.recognizedText$.pipe(take(1)),
                    this.recordRequest$.pipe(take(1))
                ).pipe(
                    map((result: string | RecordRequest) => {
                        this.isRecording$.next(false);
                        const resultArray: [string | RecordRequest, RecordRequest] = [result, request];
                        return resultArray;
                    })
                );
            })
        ).subscribe(async ([result, request]: [string | RecordRequest, RecordRequest]) => {
            request.recording$.next(false);
            if (typeof result === 'object') {
                request.rejectSentence(new Error("Audio recording not completed"))
            } else {
                this.currentRecognizedText$.next(result)
                request.resolveSentence(result);
            }
        })
    }

    private async countdown(duration: number) {
        const countdownIncrement = 500;
        const countdownStart = Math.floor((duration + countdownIncrement) / (countdownIncrement));
        for (let i = 0; i <= countdownStart; i++) {
            this.countdown$.next(countdownStart - i);
            await sleep(countdownIncrement)
        }
    }
}


