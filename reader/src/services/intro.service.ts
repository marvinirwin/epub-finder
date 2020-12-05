import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {filter, map, take} from "rxjs/operators";
import introJs from 'intro.js';
import {SettingsService} from "./settings.service";
import {HighlighterService} from "../lib/Highlighting/highlighter.service";
import {TemporaryHighlightService} from "../lib/Highlighting/temporary-highlight.service";
import {sleep} from "../lib/Util/Util";
import {ds_Dict} from "../lib/Tree/DeltaScanner";
import {AtomizedSentence} from "../lib/Atomized/AtomizedSentence";
import {flatten} from "lodash";
import {RandomColorsService} from "./random-colors.service";

export class IntroService {
    titleRef$ = new ReplaySubject<HTMLSpanElement | null>(1);
    readingFrameRef$ = new ReplaySubject<HTMLIFrameElement | null>(1);
    trySpeakingRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    watchSentencesRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    playbackSpeedRef$ = new ReplaySubject<HTMLDivElement | null>(1);
    sectionsRef$ = new ReplaySubject<HTMLDivElement | null>(1);

    constructor({
                    pronunciationVideoRef$,
                    settingsService,
                    temporaryHighlightService,
                    atomizedSentences$
                }: {
        pronunciationVideoRef$: Observable<HTMLVideoElement | null>,
        settingsService: SettingsService,
        temporaryHighlightService: TemporaryHighlightService,
        atomizedSentences$: Observable<ds_Dict<AtomizedSentence[]>>
    }) {


        const randomRange = (min: number, max: number, maxRangeSize: number): [number, number] =>  {
            const startRange = max - min;
            const start = (Math.random() * startRange) + min;
            const endRange = max - start;
            return [start, Math.min(Math.floor(start + (Math.random() * endRange) + 1), start + maxRangeSize)]
        }
        const intro = introJs();
        atomizedSentences$.pipe(
            map(atomizedSentences => flatten(Object.values(atomizedSentences))),
            filter(atomizedSentences => atomizedSentences.length >= 10),
            take(1)
        ).subscribe(async atomizedSentences => {
            const allSentences = atomizedSentences.slice(0,10).map(atomizedSentence => atomizedSentence.translatableText);

            function getRandomWords() {
                return allSentences.map(sentence => sentence.slice(...randomRange(0, sentence.length, 3)));
            }

            const randomWords = [...getRandomWords(), ...getRandomWords(), ...getRandomWords()]
            for (let i = 0; i < randomWords.length; i++) {
                const randomWord = randomWords[i];
                temporaryHighlightService.highlightTemporaryWord(randomWord, RandomColorsService.randomColor(), 1000);
                await sleep (100);
            }
        })


        combineLatest([
            this.titleRef$,
            this.readingFrameRef$,
            this.trySpeakingRef$,
            this.watchSentencesRef$
        ]).pipe(filter(refs => refs.every(ref => ref)))
            .subscribe(async ([titleRef, readingFrameRef, trySpeakingRef, watchSentenceRef]) => {
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
                            intro: `Click or highlight any of these sections to play parts of the video`
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