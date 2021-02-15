import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, filter, map, mapTo, shareReplay, take, distinct} from "rxjs/operators";
import {IntroSeriesService} from "./intro-series.service";
import {VideoMetadata} from "../../components/pronunciation-video/video-meta-data.interface";

export const SKIP_INTRO = new URLSearchParams(window.location.search).has('skip_intro')

export class IntroService {
    titleRef$ = new ReplaySubject<HTMLSpanElement | null>(1);
    readingFrameRef$ = new ReplaySubject<HTMLIFrameElement | null>(1);
    trySpeakingRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    watchSentencesRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    playbackSpeedRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    sectionsRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    promptFirstIntro$ = new BehaviorSubject<any>(1);
    promptSecondIntro$ = new BehaviorSubject<any>(1);

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
            this.titleRef$.pipe(distinctUntilChanged()),
            this.readingFrameRef$.pipe(distinctUntilChanged()),
            this.trySpeakingRef$.pipe(distinctUntilChanged()),
            this.watchSentencesRef$.pipe(distinctUntilChanged()),
            this.promptFirstIntro$.pipe(distinctUntilChanged()),
        ]).pipe(
            filter(() => !SKIP_INTRO),
            filter(refs => refs.every(ref => ref)),
            debounceTime(1000),
            take(1),
            shareReplay(1)
        );
        firstIntro$.subscribe(async ([titleRef, readingFrameRef, trySpeakingRef, watchSentenceRef]) => {
            return;
            introSeriesService.addSteps(
                [
                    {
                        element: titleRef as HTMLElement,
                        intro: `Welcome to Language Trainer!`
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
            pronunciationVideoRef$.pipe(distinctUntilChanged()),
            this.playbackSpeedRef$.pipe(distinctUntilChanged()),
            this.sectionsRef$.pipe(distinctUntilChanged()),
            currentVideoMetadata$.pipe(distinctUntilChanged()),
            this.promptSecondIntro$.pipe(distinctUntilChanged()),
        ]).pipe(
            filter(() => !SKIP_INTRO),
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
                            intro: `Watch how a native speaker speaks, if you're having difficulty try and imitate the way the mount moves from word to word`,
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
