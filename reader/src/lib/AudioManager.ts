import {AudioRecorder} from "./AudioRecorder";
import {combineLatest, Observable, of, zip} from "rxjs";
import {WavAudio} from "./WavAudio";
import {Manager} from "./Manager";
import {debounceTime, filter, map, shareReplay, switchMap} from "rxjs/operators";

export type AudioPair = { user: WavAudio, synth: WavAudio };

export class AudioManager {
    audioRecorder: AudioRecorder = new AudioRecorder();
    currentSynthesizedAudio$: Observable<WavAudio | undefined>;
    userAndSyntheticAudioLineUp$: Observable<AudioPair>;
    lineupGraphs$: Observable<[number[], number[]]>;

    constructor(public m: Manager) {
        this.currentSynthesizedAudio$ = m.currentEditingCard$.pipe(
            switchMap(c => c?.synthesizedSpeech$ || of(undefined))
        )
        /*
         * Im probably going to have to pair synth audio with user audio emitted after
         */
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
    }
}