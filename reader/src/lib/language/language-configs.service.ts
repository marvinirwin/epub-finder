import {SettingsService} from "../../services/settings.service";
import {map, shareReplay} from "rxjs/operators";
import {SupportedTranslationService} from "./supported-translation.service";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {fetchTranslation, TranslateConfig} from "../../services/translate.service";
import {SpeechToTextConfig, SupportedSpeechToTextService} from "./supported-speech-to-text.service";
import {SupportedTransliterationService} from "./supported-transliteration.service";
import {transliterate} from "./transliterate.service";

export type PossibleTranslationConfig = { from: string, to: string } | undefined;
export type PossibleTransliterationConfig = { language: string, fromScript: string, toScript: string } | undefined;

export class LanguageConfigsService {
    public knownToLearningTranslate$: Observable<PossibleTranslationConfig>;
    public learningToKnownTranslateConfig: Observable<PossibleTranslationConfig>;
    public learningToLatinTransliterateFn$: Observable<PossibleTransliterationConfig>;
    public latinToLearningTransliterate$: Observable<PossibleTransliterationConfig>;
    public potentialLearningSpoken$: Observable<SpeechToTextConfig[]>;

    constructor(
        {
            settingsService
        }: {
            settingsService: SettingsService
        }
    ) {
        const knownLanguage$ = new ReplaySubject<string>(1);
        knownLanguage$.next('en');
        const getLanguageCodeObservable = <T>(f: (knownLanguageCode: string, learningLanguageCode: string) => T) =>
            combineLatest([
                knownLanguage$,
                settingsService.readingLanguage$
            ]).pipe(
                map(([knownLanguage, learningLanguage]) => f(knownLanguage, learningLanguage)),
                shareReplay(1)
            );
        this.knownToLearningTranslate$ = getLanguageCodeObservable((knownLanguageCode, learningLanguageCode) => {
            const supportedLanguage = SupportedTranslationService
                .SupportedTranslations.find(({code}) => code === knownLanguageCode);
            if (supportedLanguage) {
                return {
                    from: supportedLanguage.code,
                    to: learningLanguageCode
                }
            }
        });
        this.learningToKnownTranslateConfig = getLanguageCodeObservable((knownLanguageCode, learningLanguageCode) => {
            const supportedLanguage = SupportedTranslationService
                .SupportedTranslations.find(({code}) => code === knownLanguageCode);
            if (supportedLanguage) {
                return {
                    from: learningLanguageCode,
                    to: knownLanguageCode,
                }
            }
        });

        this.potentialLearningSpoken$ = getLanguageCodeObservable((knownLanguageCode, learningLanguageCode) => {
            const textSpeechMap = {
                'zh-hant': [
                    'zh-cn',
                    'zh-tw',
                    'zh-hk',
                ],
                'zh-hans': [
                    'zh-cn',
                    'zh-tw',
                    'zh-hk',
                ],
                'af': [
                    'en-za'
                ],
                'ar': [
                    'ar-iq',
                    `ar-bh`,
                    `ar-eg`,
                    `ar-iq`,
                    `ar-il`,
                    `ar-jo`,
                    `ar-kw`,
                    `ar-lb`,
                    `ar-om`,
                    `ar-qa`,
                    `ar-sa`,
                    `ar-ps`,
                    `ar-sy`,
                    `ar-ae`,
                ],
                'bg': [
                    'bg-bg'
                ],
                'ca': [
                    'ca-est',
                ],
                'hr': [
                    `hr-hr`
                ],
                'cs': [
                    'cs-cz'
                ],
                'da': [
                    'da-dk'
                ],
                'nl': [
                    'nl-nl'
                ],
                'en': [
                    `en-au`,
                    `en-ca`,
                    `en-hk`,
                    `en-in`,
                    `en-ie`,
                    `en-nz`,
                    `en-ng`,
                    `en-ph`,
                    `en-sg`,
                    `en-za`,
                    `en-gb`,
                    `en-us`,
                ],
                'et': [
                    `et-ee`
                ],
                'fi': [
                    'fi-fi'
                ],
                'fr': [
                    'fr-fr'
                ],
                'fr-ca': [
                    'fr-ca'
                ],
                'de': [
                    `de-de`
                ],
                'el': [
                    'el-gr'
                ],
                'gu': [
                    `gu-in`
                ],
                'hi': [
                    `hi-in`
                ],
                'hu': [
                    'hu-hu'
                ],
                'ga': [
                    'ga-ie'
                ],
                'it': [
                    'it-it'
                ],
                'ja': [
                    `ja-jp`
                ],
                'ko': [
                    'ko-kr'
                ],
                'lv': [
                    `lv-lv`
                ],
                'lt': [
                    'lt-lt'
                ],
                'mt': [],
                'mr': [
                    `mr-in`
                ],
                'nb': [
                    `nb-no`
                ],
                'pl': [
                    `pl-pl`
                ],
                'pt-br': [
                    `pt-br`
                ],
                'pt-pt': [
                    `pt-pt`
                ],
                'ro': [
                    `ro-ro`
                ],
                'ru': [
                    'ru-ru',
                ],
                'sk': [
                    'sk-sk'
                ],
                'sl': [
                    'sl-si'
                ],
                'es': [
                    `es-ar`,
                    `es-bo`,
                    `es-cl`,
                    `es-co`,
                    `es-cr`,
                    `es-cu`,
                    `es-do`,
                    `es-ec`,
                    `es-sv`,
                    `es-gq`,
                    `es-gt`,
                    `es-hn`,
                    `es-mx`,
                    `es-ni`,
                    `es-pa`,
                    `es-py`,
                    `es-pe`,
                    `es-pr`,
                    `es-es`,
                    `es-uy`,
                    `es-us`,
                    `es-ve`,
                ],
                'sv': [
                    `sv-se`
                ],
                'ta': [
                    `ta-in`
                ],
                'te': [
                    `te-in`
                ],
                'th': [
                    `th-th`
                ],
                'tr': [
                    `tr-tr`
                ]
            } as { [key: string]: string[] };
            const lowerCode = learningLanguageCode.toLowerCase();
            return (textSpeechMap[lowerCode] || [])
                .map(code => SupportedSpeechToTextService.ConfigMap.get(code)) as SpeechToTextConfig[]
                ;
            /*
                        const speechToTextConfigs = SupportedSpeechToTextService.Configs;
                        const supportedLanguage = speechToTextConfigs.find(({code}) =>
                            ?.includes(code.toLowerCase())
                        );
                        if (supportedLanguage) {
                            return supportedLanguage.code;
                        }
            */
        });
        combineLatest([
                this.potentialLearningSpoken$,
                settingsService.spokenLanguage$
            ]
        ).subscribe(([potentialSpokenLanguageConfigs, currentSpokenLanguageCode]) => {
            const firstPotentialSpokenLanguageConfig = potentialSpokenLanguageConfigs[0];
            const shouldSetDefaultSpokenLanguage = !currentSpokenLanguageCode && firstPotentialSpokenLanguageConfig;
            if (shouldSetDefaultSpokenLanguage) {
                settingsService.spokenLanguage$.next(firstPotentialSpokenLanguageConfig.code)
            }
            const shouldClearSpokenLanguage = currentSpokenLanguageCode &&
                !potentialSpokenLanguageConfigs.map(c => c.code).includes(currentSpokenLanguageCode);
            if (shouldClearSpokenLanguage) {
                settingsService.spokenLanguage$.next('')
            }
        })
        const supportedTransliterations = SupportedTransliterationService.SupportedTransliteration;
        this.learningToLatinTransliterateFn$ = getLanguageCodeObservable((knownLanguageCode, learningLanguageCode) => {
            const goesToLatin = supportedTransliterations.find(({script1, script2, bidirectional, code}) => {
                return code.toLowerCase() === learningLanguageCode.toLowerCase() &&
                    script2 === 'Latn'
            });
            if (goesToLatin) {
                return {

                    language: goesToLatin.code,
                    fromScript: goesToLatin.script1,
                    toScript: goesToLatin.script2
                }
            }
            return
        });
        this.latinToLearningTransliterate$ = getLanguageCodeObservable((knownLanguageCode, learningLanguageCode) => {
            // Need script2 and bidirectional
            // Is there a script1 that's latin?  Only for serbian, but that's a serial case
            const goesFromLatin = supportedTransliterations.find(({script1, script2, bidirectional, code}) => {
                return code.toLowerCase() === learningLanguageCode.toLocaleLowerCase() &&
                    script2 === 'Latn' &&
                    bidirectional;

            });
            if (goesFromLatin) {
                return {
                    language: learningLanguageCode,
                    fromScript: goesFromLatin.script2,
                    toScript: goesFromLatin.script1,
                }
            }
        });
    }
}