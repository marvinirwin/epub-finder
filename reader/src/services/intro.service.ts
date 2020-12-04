import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {filter} from "rxjs/operators";
import introJs from 'intro.js';
import {SettingsService} from "./settings.service";

export class IntroService {
    titleRef$ = new ReplaySubject<HTMLSpanElement | null>(1);
    readingFrameRef$ = new ReplaySubject<HTMLIFrameElement | null>(1);
    trySpeakingRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    watchSentencesRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    playbackSpeedRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    sectionsRef$ = new ReplaySubject<HTMLDivElement | null>(1);

    constructor({
                    pronunciationVideoRef$,
                    settingsService
                }: {
        pronunciationVideoRef$: Observable<HTMLVideoElement | null>,
        settingsService: SettingsService
    }) {
        const intro = introJs();
        combineLatest([
            this.titleRef$,
            this.readingFrameRef$,
            this.trySpeakingRef$,
            this.watchSentencesRef$
        ]).pipe(filter(refs => refs.every(ref => ref)))
            .subscribe(([titleRef, readingFrameRef, trySpeakingRef, watchSentenceRef]) => {
                // Now do the intro if necessary
                intro.setOptions({
                    steps: [
                        {
                            element: titleRef as HTMLElement,
                            intro: `Welcome to Mandarin Trainer!`
                        },
                        {
                            element: readingFrameRef as HTMLElement,
                            intro: "This is a story composed of exclusively HSK-1 words and a cluster of words related to kitchens.  Repeat words  are distributed evenly throughout the story for maximum retention.",
                        },
                        {
                            element: trySpeakingRef as HTMLElement,
                            intro: `Click this to test your pronunciation against voice-recognition.  If your words are understood your progress will be visually highlighted in the story`,
                        },
                        {
                            element: watchSentenceRef as HTMLElement,
                            intro: `Need help pronouncing something?  Click watch sentence and then click a highlighted sentence`,
                        },

                    ]
                }).start();
            });
        combineLatest([
            pronunciationVideoRef$,
            this.playbackSpeedRef$,
            this.sectionsRef$
        ]).pipe(filter(refs => refs.every(ref => ref))).subscribe(
            ([pronunciationVideoRef, playbackSpeedRef, sectionsRef]) => {
                // What happens if things are already started?
                intro.setOptions({
                    steps: [
                        {
                            element: pronunciationVideoRef as HTMLElement,
                            intro: `Watch how a native speaker speaks, if you're having difficulty try and imitate the way the mount moves from word to work `,
                        },
                        {
                            element: sectionsRef as HTMLElement,
                            intro: ``
                        },
                        {
                            element: playbackSpeedRef as HTMLElement,
                            intro: `Use this to slow and and speed up the video playback`,
                        },
                    ]
                }).start()
            })
    }

}