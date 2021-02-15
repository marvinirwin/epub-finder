import {AudioRecorder} from "../audio/audio-recorder.service";
import {ReplaySubject} from "rxjs";
import {WavAudio} from "../WavAudio";
import {flatMap, take} from "rxjs/operators";
import {AudioSource} from "../audio/AudioSource";
import {fetchSynthesizedAudio} from "../audio/FetchSynthesizedAudio";
import {sleep} from "../Util/Util";


export type AudioPair = { user: WavAudio, synth: WavAudio };

export class AudioManager {
    audioRecorder: AudioRecorder;
    currentSynthesizedAudio$ = new ReplaySubject<WavAudio>(1);
    queSynthesizedSpeechRequest$ = new ReplaySubject<string>(1);

    /*
        userAndSyntheticAudioLineUp$: Observable<AudioPair>;
        lineupGraphs$: Observable<[number[], number[]]>;
    */

    constructor(audioSource: AudioSource) {
        this.audioRecorder = new AudioRecorder({audioSource});
        this.queSynthesizedSpeechRequest$.pipe(
            flatMap(async speechText => {
                    const wavAudio = await fetchSynthesizedAudio(speechText);
                    if (!wavAudio) {
                        return;
                    }
                    this.currentSynthesizedAudio$.next(wavAudio);
                    const duration = await wavAudio.duration$.pipe(take(1)).toPromise();
                    // Is this seconds or milliseconds?
                    await sleep(duration * 1000);
                },
                1
            )
        ).subscribe()
        /*
         * Im probably going to have to pair synth audio with user audio emitted after
         */
        /*
                this.userAndSyntheticAudioLineUp$ = combineLatest([
                    this.audioRecorder.userAudio$,
                    this.currentSynthesizedAudio$
                ]).pipe(
                    filter(([user, synth]) => !!(user && synth)),
                    debounceTime(100),
                    map(([user, synth]) => {
                        return {user, synth} as AudioPair;
                    }),
                    shareReplay(1)
                );

                this.lineupGraphs$ = this.userAndSyntheticAudioLineUp$.pipe(
                    switchMap(({synth, user}) =>
                        zip(synth.graphData$, user.graphData$)
                    )
                )
        */
    }
}