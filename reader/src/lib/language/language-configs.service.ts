import {SettingsService} from "../../services/settings.service";
import {map, shareReplay} from "rxjs/operators";
import {
  resolvePartialTabulationConfig,
  resolveRomanizationConfig,
  SpeechToTextConfig,
  SupportedTranslations,
  SupportedTransliterations,
  TextToSpeechConfig,
  TextToSpeechConfigs,
  WordIdentifyingStrategy
} from "@shared/";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {mapTranslatableLanguagesToSpokenOnes} from "./mapTranslatableLanguagesToSpokenOnes";

export type PossibleTranslationConfig = { from: string; to: string } | undefined
export type PossibleTransliterationConfig =
  | { language: string; fromScript: string; toScript: string }
  | undefined;
export type PossibleTextToSpeechConfig = TextToSpeechConfig | undefined;


export const resolveTextToSpeechConfig = (readingLanguage: string) => {
  if (readingLanguage.startsWith("zh")) {
    readingLanguage = "zh";
  }
  return TextToSpeechConfigs.filter(config => config.locale.includes(readingLanguage));
};

export class LanguageConfigsService {
  public knownToLearningTranslate$: Observable<PossibleTranslationConfig>;
  public learningToKnownTranslateConfig$: Observable<PossibleTranslationConfig>;
  public learningToLatinTransliterateFn$: Observable<PossibleTransliterationConfig>;
  public latinToLearningTransliterate$: Observable<PossibleTransliterationConfig>;
  public potentialLearningSpoken$: Observable<SpeechToTextConfig[]>;
  learningLanguageTextToSpeechConfig$: Observable<PossibleTextToSpeechConfig>;
  public potentialLearningLanguageTextToSpeechConfigs$: Observable<TextToSpeechConfig[]>;
  readingLanguageCode$: Observable<string>;
  wordSeparationStrategy$: Observable<WordIdentifyingStrategy>;

  constructor({ settingsService }: { settingsService: SettingsService }) {
    const knownLanguage$ = new ReplaySubject<string>(1);
    knownLanguage$.next("en");
    this.learningLanguageTextToSpeechConfig$ = settingsService.textToSpeechConfiguration$.obs$;
    const getLanguageCodeObservable = <T>(
      f: (knownLanguageCode: string, learningLanguageCode: string) => T
    ) =>
      combineLatest([
        knownLanguage$,
        settingsService.readingLanguage$.obs$
      ]).pipe(
        map(([knownLanguage, learningLanguage]) =>
          f(knownLanguage, learningLanguage)
        ),
        shareReplay(1)
      );
    this.knownToLearningTranslate$ = getLanguageCodeObservable(
      (knownLanguageCode, learningLanguageCode) => {
        const supportedLanguage = SupportedTranslations.find(
          ({ code }) => code === knownLanguageCode
        );
        if (supportedLanguage) {
          return {
            from: supportedLanguage.code,
            to: learningLanguageCode
          };
        }
      }
    );
    this.learningToKnownTranslateConfig$ = getLanguageCodeObservable(
      (knownLanguageCode, learningLanguageCode) => {
        const supportedLanguage = SupportedTranslations.find(
          ({ code }) => code === knownLanguageCode
        );
        if (supportedLanguage) {
          return {
            from: learningLanguageCode,
            to: knownLanguageCode
          };
        }
      }
    );
    this.readingLanguageCode$ = this.learningToKnownTranslateConfig$.pipe(
      map((translationConfig) => translationConfig?.from || "en"),
      shareReplay(1)
    );


    this.potentialLearningLanguageTextToSpeechConfigs$ = settingsService.readingLanguage$.obs$
      .pipe(
        map(readingLanguage => {
          return resolveTextToSpeechConfig(readingLanguage);
        }),
        shareReplay(1)
      );

    this.wordSeparationStrategy$ = this.readingLanguageCode$.pipe(
      map(readingLanguageCode => resolvePartialTabulationConfig(readingLanguageCode).wordIdentifyingStrategy),
      shareReplay(1)
    );

    this.potentialLearningSpoken$ = getLanguageCodeObservable(
      (_, learningLanguageCode) => mapTranslatableLanguagesToSpokenOnes(learningLanguageCode)
    );
    this.learningToLatinTransliterateFn$ = getLanguageCodeObservable(
      (knownLanguageCode, learningLanguageCode) => {
        const goesToLatin = resolveRomanizationConfig(learningLanguageCode);
        if (goesToLatin) {
          return {
            language: goesToLatin.code,
            fromScript: goesToLatin.script1,
            toScript: goesToLatin.script2
          };
        }
        return;
      }
    );
    this.latinToLearningTransliterate$ = getLanguageCodeObservable(
      (knownLanguageCode, learningLanguageCode) => {
        // Need script2 and bidirectional
        // Is there a script1 that's latin?  Only for serbian, but that's a serial case
        const goesFromLatin = SupportedTransliterations.find(
          ({ script1, script2, bidirectional, code }) => {
            return (
              code.toLowerCase() ===
              learningLanguageCode.toLocaleLowerCase() &&
              script2 === "Latn" &&
              bidirectional
            );
          }
        );
        if (goesFromLatin) {
          return {
            language: learningLanguageCode,
            fromScript: goesFromLatin.script2,
            toScript: goesFromLatin.script1
          };
        }
      }
    );

    combineLatest([
      this.potentialLearningSpoken$,
      settingsService.spokenLanguage$.obs$
    ]).subscribe(
      ([potentialSpokenLanguageConfigs, currentSpokenLanguageCode]) => {
        const firstPotentialSpokenLanguageConfig = potentialSpokenLanguageConfigs[0];
        /*
                        const shouldSetDefaultSpokenLanguage = (!currentSpokenLanguageCode || !potentialSpokenLanguageConfigs.find(config => config.code === currentSpokenLanguageCode)) &&
                            firstPotentialSpokenLanguageConfig
        */
        /*
                        if (shouldSetDefaultSpokenLanguage) {
                            settingsService.spokenLanguage$.next(
                                firstPotentialSpokenLanguageConfig.code,
                            )
                            return
                        }
        */
        const shouldClearSpokenLanguage =
          currentSpokenLanguageCode &&
          !potentialSpokenLanguageConfigs
            .map((c) => c.code)
            .includes(currentSpokenLanguageCode);
        if (shouldClearSpokenLanguage) {
          settingsService.spokenLanguage$.user$.next("");
        }
      }
    );

    combineLatest([
      this.potentialLearningLanguageTextToSpeechConfigs$,
      settingsService.textToSpeechConfiguration$.obs$
    ]).subscribe(([potentialTextToSpeechConfigs, currentTextToSpeechConfig]) => {
      const firstPotentialTextToSpeechConfig = potentialTextToSpeechConfigs[0];
      const isCurrentConfigViable = potentialTextToSpeechConfigs.find(speechConfig => speechConfig.voice === currentTextToSpeechConfig?.voice);
      const shouldSetDefaultTextToSpeechLanguage = (
        !currentTextToSpeechConfig ||
        !isCurrentConfigViable
      ) && firstPotentialTextToSpeechConfig;

      if (shouldSetDefaultTextToSpeechLanguage) {
        settingsService.textToSpeechConfiguration$.user$.next(firstPotentialTextToSpeechConfig);
        return;
      }
      if (!isCurrentConfigViable && currentTextToSpeechConfig) {
        settingsService.textToSpeechConfiguration$.user$.next(undefined);
      }
    });
  }
}
