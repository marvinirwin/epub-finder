import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {debounceTime, filter, map, mapTo, shareReplay, take} from "rxjs/operators";
import {IntroSeriesService} from "./intro-series.service";
import {VideoMetadata} from "../../components/PronunciationVideo/video-meta-data.interface";

export class IntroService {
    titleRef$ = new ReplaySubject<HTMLSpanElement | null>(1);
    readingFrameRef$ = new ReplaySubject<HTMLIFrameElement | null>(1);
    trySpeakingRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    watchSentencesRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    playbackSpeedRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    sectionsRef$ = new ReplaySubject<HTMLDivElement | null>(1);

    constructor({
                    pronunciationVideoRef$,
                    introSeriesService,
                    currentVideoMetadata$
                }: {
        pronunciationVideoRef$: Observable<HTMLVideoElement | null>,
        introSeriesService: IntroSeriesService,
        currentVideoMetadata$: Observable<VideoMetadata | undefined>
    }) {


        const firstIntro$ = combineLatest([
            this.titleRef$,
            this.readingFrameRef$,
            this.trySpeakingRef$,
            this.watchSentencesRef$
        ]).pipe(
            filter(refs => refs.every(ref => ref)),
            debounceTime(1000),
            take(1),
            shareReplay(1)
        );
        firstIntro$.subscribe(async ([titleRef, readingFrameRef, trySpeakingRef, watchSentenceRef]) => {
            introSeriesService.addSteps(
                [
                    {
                        element: titleRef as HTMLElement,
                        intro: `Welcome to Mandarin Trainer!`
                    },
                    {
                        element: readingFrameRef as HTMLElement,
                        intro: `This is a story composed of exclusively HSK-1 words and kitchen words.  
                            Words are repeated and distributed evenly throughout the story to aid memorization.`,
                    },
                    {
                        element: trySpeakingRef as HTMLElement,
                        intro: `Click this to test your pronunciation with voice-recognition.  If your words are understood your progress will be visually highlighted in the story`,
                    },
                    {
                        element: watchSentenceRef as HTMLElement,
                        intro: `Need help pronouncing something?  Watch how a native speaker is by click then and then selecting a sentence.`,
                    },

                ],
                firstIntro$.pipe(mapTo(undefined))
            )
        });

        const secondIntro$ = combineLatest([
            pronunciationVideoRef$,
            this.playbackSpeedRef$,
            this.sectionsRef$,
            currentVideoMetadata$
        ]).pipe(
            filter(refs => refs.every(ref => ref)),
            debounceTime(1000),
            take(1)
        );
        secondIntro$.subscribe(
            ([pronunciationVideoRef, playbackSpeedRef, sectionsRef]) => {
                introSeriesService.addSteps(
                    [
                        {
                            element: pronunciationVideoRef as HTMLElement,
                            intro: `Watch how a native speaker speaks, if you're having difficulty try and imitate the way the mount moves from word to work `,
                            position: 'left'
                        },
                        {
                            element: sectionsRef as HTMLElement,
                            intro: `Click or highlight any of these sections to play parts of the video`
                        },
                        {
                            element: playbackSpeedRef as HTMLElement,
                            intro: `Use this to slow and and speed up the video playback`,
                        },
                    ],
                    secondIntro$.pipe(mapTo(undefined))
                )
            });

    }

}
