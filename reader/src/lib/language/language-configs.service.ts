import { SettingsService } from '../../services/settings.service'
import { map, shareReplay } from 'rxjs/operators'
import { SupportedTranslationService } from './supported-translation.service'
import { combineLatest, Observable, ReplaySubject } from 'rxjs'
import {
    SpeechToTextConfig,
    SupportedSpeechToTextService,
} from './supported-speech-to-text.service'
import { SupportedTransliterationService } from './supported-transliteration.service'
import { TextSpeechMap } from './text-speech-map'

export type PossibleTranslationConfig = { from: string; to: string } | undefined
export type PossibleTransliterationConfig =
    | { language: string; fromScript: string; toScript: string }
    | undefined

export class LanguageConfigsService {
    public knownToLearningTranslate$: Observable<PossibleTranslationConfig>
    public learningToKnownTranslateConfig$: Observable<PossibleTranslationConfig>
    public learningToLatinTransliterateFn$: Observable<PossibleTransliterationConfig>
    public latinToLearningTransliterate$: Observable<PossibleTransliterationConfig>
    public potentialLearningSpoken$: Observable<SpeechToTextConfig[]>
    readingLanguageCode$: Observable<string>

    constructor({ settingsService }: { settingsService: SettingsService }) {
        const knownLanguage$ = new ReplaySubject<string>(1)
        knownLanguage$.next('en')
        const getLanguageCodeObservable = <T>(
            f: (knownLanguageCode: string, learningLanguageCode: string) => T,
        ) =>
            combineLatest([
                knownLanguage$,
                settingsService.readingLanguage$,
            ]).pipe(
                map(([knownLanguage, learningLanguage]) =>
                    f(knownLanguage, learningLanguage),
                ),
                shareReplay(1),
            )
        this.knownToLearningTranslate$ = getLanguageCodeObservable(
            (knownLanguageCode, learningLanguageCode) => {
                const supportedLanguage = SupportedTranslationService.SupportedTranslations.find(
                    ({ code }) => code === knownLanguageCode,
                )
                if (supportedLanguage) {
                    return {
                        from: supportedLanguage.code,
                        to: learningLanguageCode,
                    }
                }
            },
        )
        this.learningToKnownTranslateConfig$ = getLanguageCodeObservable(
            (knownLanguageCode, learningLanguageCode) => {
                const supportedLanguage = SupportedTranslationService.SupportedTranslations.find(
                    ({ code }) => code === knownLanguageCode,
                )
                if (supportedLanguage) {
                    return {
                        from: learningLanguageCode,
                        to: knownLanguageCode,
                    }
                }
            },
        )
        this.readingLanguageCode$ = this.learningToKnownTranslateConfig$.pipe(
            map((translationConfig) => translationConfig?.from || 'en'),
            shareReplay(1),
        )

        this.potentialLearningSpoken$ = getLanguageCodeObservable(
            (knownLanguageCode, learningLanguageCode) => {
                const lowerCode = learningLanguageCode.toLowerCase()
                return (TextSpeechMap[lowerCode] || []).map((code) =>
                    SupportedSpeechToTextService.ConfigMap.get(code),
                ) as SpeechToTextConfig[]
                /*
                        const speechToTextConfigs = SupportedSpeechToTextService.Configs;
                        const supportedLanguage = speechToTextConfigs.find(({code}) =>
                            ?.includes(code.toLowerCase())
                        );
                        if (supportedLanguage) {
                            return supportedLanguage.code;
                        }
            */
            },
        )
        combineLatest([
            this.potentialLearningSpoken$,
            settingsService.spokenLanguage$,
        ]).subscribe(
            ([potentialSpokenLanguageConfigs, currentSpokenLanguageCode]) => {
                const firstPotentialSpokenLanguageConfig =
                    potentialSpokenLanguageConfigs[0]
                const shouldSetDefaultSpokenLanguage =
                    !currentSpokenLanguageCode &&
                    firstPotentialSpokenLanguageConfig
                if (shouldSetDefaultSpokenLanguage) {
                    settingsService.spokenLanguage$.next(
                        firstPotentialSpokenLanguageConfig.code,
                    )
                }
                const shouldClearSpokenLanguage =
                    currentSpokenLanguageCode &&
                    !potentialSpokenLanguageConfigs
                        .map((c) => c.code)
                        .includes(currentSpokenLanguageCode)
                if (shouldClearSpokenLanguage) {
                    settingsService.spokenLanguage$.next('')
                }
            },
        )
        const supportedTransliterations =
            SupportedTransliterationService.SupportedTransliteration
        this.learningToLatinTransliterateFn$ = getLanguageCodeObservable(
            (knownLanguageCode, learningLanguageCode) => {
                const goesToLatin = supportedTransliterations.find(
                    ({ script1, script2, bidirectional, code }) => {
                        return (
                            code.toLowerCase() ===
                                learningLanguageCode.toLowerCase() &&
                            script2 === 'Latn'
                        )
                    },
                )
                if (goesToLatin) {
                    return {
                        language: goesToLatin.code,
                        fromScript: goesToLatin.script1,
                        toScript: goesToLatin.script2,
                    }
                }
                return
            },
        )
        this.latinToLearningTransliterate$ = getLanguageCodeObservable(
            (knownLanguageCode, learningLanguageCode) => {
                // Need script2 and bidirectional
                // Is there a script1 that's latin?  Only for serbian, but that's a serial case
                const goesFromLatin = supportedTransliterations.find(
                    ({ script1, script2, bidirectional, code }) => {
                        return (
                            code.toLowerCase() ===
                                learningLanguageCode.toLocaleLowerCase() &&
                            script2 === 'Latn' &&
                            bidirectional
                        )
                    },
                )
                if (goesFromLatin) {
                    return {
                        language: learningLanguageCode,
                        fromScript: goesFromLatin.script2,
                        toScript: goesFromLatin.script1,
                    }
                }
            },
        )
    }
}
