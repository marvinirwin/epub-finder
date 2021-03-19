import {AudioRecorder} from "../audio/audio-recorder.service";
import {ReplaySubject} from "rxjs";
import {WavAudio} from "../WavAudio";
import {flatMap, take} from "rxjs/operators";
import {AudioSource} from "../audio/AudioSource";
import {fetchSynthesizedAudio} from "../audio/FetchSynthesizedAudio";
import {sleep} from "../util/Util";
import {GeneralToastMessageService} from "../general-toast-message.service";
import {Typography} from "@material-ui/core";
import React, {useContext, useEffect, useRef, useState} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";


export type AudioPair = { user: WavAudio, synth: WavAudio };

function useCancellablePromise<T>() {
    const promises = useRef<{ cancel: () => void }[]>();
    // useEffect initializes the promises array
    // and cleans up by calling cancel on every stored
    // promise.
    // Empty array as input to useEffect ensures that the hook is
    // called once during mount and the cancel() function called
    // once during unmount
    useEffect(
        () => {
            promises.current = promises.current || [];
            return function cancel() {
                promises?.current?.forEach(p => p.cancel());
                promises.current = [];
            };
        }, []
    );

    // cancelablePromise remembers the promises that you
    // have called so far. It returns a wrapped cancelable
    // promise
    function cancellablePromise<PromiseType>(p: Promise<PromiseType>) {
        const cPromise = makeCancelable(p);
        promises?.current?.push(cPromise);
        return cPromise.promise;
    }

    return {cancellablePromise};
}

export function makeCancelable<T>(promise: Promise<T>) {
    let isCanceled = false;
    const wrappedPromise =
        new Promise<T>((resolve, reject) => {
            // Suppress resolution and rejection if canceled
            promise
                .then((val) => (!isCanceled && resolve(val)))
                .catch((error) => (!isCanceled && reject(error)));
        });
    return {
        promise: wrappedPromise,
        cancel() {
            isCanceled = true;
        },
    };
}

export const RecognizedTextComponent = (recognizedText: string): React.FC => () => {
    const m = useContext(ManagerContext);
    const [romanization, setRomanization] = useState<string>('');
    /*
        const {cancellablePromise} = useCancellablePromise();
    */
    const currentRomanizationFn = useObservableState(m.languageConfigsService.learningToLatinTransliterateFn$);
    useEffect(() => {
        if (currentRomanizationFn) {
            // @ts-ignore
            currentRomanizationFn.then((...v) => {
                // @ts-ignore
                debugger; console.log()
                // @ts-ignore
            }).catch((...err) => {
                // @ts-ignore
                    debugger; console.log()
                }
            )
            /*
                        const p = currentRomanizationFn(recognizedText);
                        p.then(setRomanization)
            */
            /*
                        cancellablePromise(p).then(setRomanization)
            */
        }
    }, [currentRomanizationFn]);
    return <>
        <Typography variant="h6">{recognizedText}</Typography>
        <Typography variant="h6">{romanization}</Typography>
    </>;
};

export class AudioManager {
    audioRecorder: AudioRecorder;
    currentSynthesizedAudio$ = new ReplaySubject<WavAudio>(1);
    queSynthesizedSpeechRequest$ = new ReplaySubject<string>(1);

    /*
        userAndSyntheticAudioLineUp$: Observable<AudioPair>;
        lineupGraphs$: Observable<[number[], number[]]>;
    */

    constructor({
                    audioSource,
                    generalToastMessageService
                }: { audioSource: AudioSource, generalToastMessageService: GeneralToastMessageService }) {
        this.audioRecorder = new AudioRecorder({audioSource});
        this.audioRecorder.currentRecognizedText$.subscribe(recognizedText => generalToastMessageService.addToastMessage$.next(RecognizedTextComponent(recognizedText)))
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