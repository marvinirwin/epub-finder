import {AudioRecorder} from "./audio/audio-recorder.service";
import {combineLatest, Observable} from "rxjs";
import {LanguageConfigsService} from "./language-configs.service";
import {map, shareReplay, switchMap} from "rxjs/operators";

export class SpeechPracticeService {
    public learningLanguage$: Observable<string | undefined>;
    public romanization$: Observable<string | undefined>;
    public translation$: Observable<string | undefined>;

    constructor(
        {
            audioRecorder,
            languageConfigsService
        }:
            {
                audioRecorder: AudioRecorder,
                languageConfigsService: LanguageConfigsService
            }
    ) {
        this.learningLanguage$ = audioRecorder.currentRecognizedText$;

        this.romanization$ = combineLatest([
            this.learningLanguage$,
            languageConfigsService.learningToLatinTransliterateFn$
        ]).pipe(
            switchMap(async ([learningLanguageText, transliterateFn]) => {
                if (transliterateFn && learningLanguageText) {
                       return transliterateFn(learningLanguageText)
                }
            }),
            shareReplay(1)
        )
        this.translation$ = combineLatest([
            this.learningLanguage$,
            languageConfigsService.learningToKnownTranslateFn$
        ]).pipe(
            switchMap(async ([learningLanguageText, translateFn]) => {
                if (translateFn && learningLanguageText) {
                    return translateFn(learningLanguageText)
                }
            }),
            shareReplay(1)
        )
    }
}