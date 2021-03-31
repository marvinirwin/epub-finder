import { Observable, ReplaySubject, Subject } from 'rxjs'
import { withLatestFrom, take, shareReplay } from 'rxjs/operators'
import { sleep } from '../util/Util'
import { MakeQuerablePromise } from '../util/QueryablePromise'
import { AudioSource } from './audio-source'

export class UnitTestAudio implements AudioSource {
    public isRecording$ = new ReplaySubject<boolean>(1)
    public beginRecordingSignal$ = new Subject<void>()
    public stopRecordingSignal$ = new Subject<void>()
    public recognizedText$ = new Subject<string>()
    public mostRecentRecognizedText$: Observable<string>
    public errors$ = new ReplaySubject<string>(1)
    public microphone$ = new ReplaySubject<MediaStream>(1)
    public learningToKnownSpeech$ = new ReplaySubject<string | undefined>(1)
    constructor(public text: string) {
        this.beginRecordingSignal$.subscribe(async () => {
            this.isRecording$.next(true)
            const nextStopSignal = MakeQuerablePromise(
                this.stopRecordingSignal$.pipe(take(1)).toPromise(),
            )
            if (!nextStopSignal.isFulfilled()) {
                // We've been given a stop signal, dont output anything
                this.recognizedText$.next(text)
            }
            this.isRecording$.next(false)
        })
        this.mostRecentRecognizedText$ = this.recognizedText$.pipe(
            shareReplay(1),
        )
    }
}
