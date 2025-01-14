import { Observable, ReplaySubject } from 'rxjs'
import { AudioSource } from './audio-source'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { audioContext } from './audio-context'
import {IAudioContext, AnalyserNode} from "standardized-audio-context";
import {observableLastValue} from "../../services/observableLastValue";

export class MicFeedbackService {
    micRef$ = new ReplaySubject<SVGSVGElement | null>(1)
    private analyser$: Observable<AnalyserNode<IAudioContext>>

    constructor({ audioSource }: { audioSource: AudioSource }) {
        this.analyser$ = audioSource.microphone$.pipe(
            switchMap(async (mediaStream) => {
                const source = (await audioContext).createMediaStreamSource(
                    mediaStream,
                )
                const analyser = (await audioContext).createAnalyser()
                source.connect(analyser)
                return analyser
            }),
            shareReplay(1),
        )
        setInterval(async () => {
            const analyser = await observableLastValue(this.analyser$)
            const micRef = await observableLastValue(this.micRef$)
            if (!analyser || !micRef) {
                return
            }
            const dataArray = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let j = 0; j < dataArray.length; j++) {
                sum = sum + Math.abs(dataArray[dataArray[j]]) / 255
            }
            micRef.style.opacity = `${Math.max(
                sum / analyser.frequencyBinCount + 0.5,
            )}`
        }, 50)
    }
}
