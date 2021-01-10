import {SettingsService} from "../services/settings.service";
import {map, shareReplay} from "rxjs/operators";
import {SupportedTranslationService} from "./supported-translation.service";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {fetchTranslation, TranslateConfig} from "../services/translate.service";
import {SupportedSpeechToTextService} from "./supported-speech-to-text.service";
import {SupportedTransliterationService} from "./supported-transliteration.service";
import {transliterate} from "./transliterate.service";

type PossibleStringFetcher = ((text: string) => Promise<string>) | undefined;

export class LanguageConfigsService {
    public knownToLearningTranslate$: Observable<PossibleStringFetcher>;
    public learningToKnownTranslate$: Observable<PossibleStringFetcher>;
    public learningToKnownSpeech$: Observable<string | undefined>;
    public learningToLatinTransliterate$: Observable<PossibleStringFetcher>;
    public latinToLearningTransliterate$: Observable<PossibleStringFetcher>;

    constructor(
        {
            settingsService
        }: {
            settingsService: SettingsService
        }
    ) {
        const knownLanguage$ = new ReplaySubject<string>(1);
        knownLanguage$.next('en');
        const h = <T>(f: (knownLanguageCode: string, learningLanguageCode: string) => T) =>
            combineLatest([
                knownLanguage$,
                settingsService.learningLanguage$
            ]).pipe(
                map(([knownLanguage, learningLanguage]) => f(knownLanguage, learningLanguage)),
                shareReplay(1)
            );
        this.knownToLearningTranslate$ = h((knownLanguageCode, learningLanguageCode) => {
            const supportedLanguage = SupportedTranslationService
                .SupportedTranslations.find(({code}) => code === knownLanguageCode);
            if (supportedLanguage) {
                return (text: string='') => fetchTranslation({
                    text,
                    from: supportedLanguage.code,
                    to: learningLanguageCode
                })
            }
        });
        this.learningToKnownTranslate$ = h((knownLanguageCode, learningLanguageCode) => {
            const supportedLanguage = SupportedTranslationService
                .SupportedTranslations.find(({code}) => code === knownLanguageCode);
            if (supportedLanguage) {
                return (text: string='') => fetchTranslation({
                    from: learningLanguageCode,
                    to: knownLanguageCode,
                    text
                })
            }
        })
        this.learningToKnownSpeech$ = h((knownLanguageCode, learningLanguageCode) => {
            const textSpeechMap = {
                'Zh-Hans': 'zh-CN'
            } as {[key: string]: string};
            const speechToTextConfigs = SupportedSpeechToTextService
                .SpeechToTextConfigs;
            const supportedLanguage = speechToTextConfigs.find(({code}) => code === textSpeechMap[learningLanguageCode]);
            if (supportedLanguage) {
                return supportedLanguage.code;
            }
        });
        let supportedTransliterations = SupportedTransliterationService.SupportedTransliteration;
        this.learningToLatinTransliterate$ = h((knownLanguageCode, learningLanguageCode) => {
            const goesToLatin = supportedTransliterations.find(({script1, script2, bidirectional, code}) => {
                return code.toLowerCase() === learningLanguageCode.toLowerCase() &&
                    script2 === 'Latn'
            });
            /**
             */
            if (goesToLatin) {
                return (text: string='') =>
                    transliterate({
                        text,
                        language: goesToLatin.code,
                        fromScript: goesToLatin.script1,
                        toScript: goesToLatin.script2
                    })
            }
            return
        });
        this.latinToLearningTransliterate$ = h((knownLanguageCode, learningLanguageCode) => {
            // Need script2 and bidirectional
            // Is there a script1 that's latin?  Only for serbian, but that's a serial case
            const goesFromLatin = supportedTransliterations.find(({script1, script2, bidirectional, code}) => {
                return code.toLowerCase() === learningLanguageCode.toLocaleLowerCase() &&
                    script2 === 'Latn' &&
                    bidirectional;

            });
            if (goesFromLatin) {
                return (text: string = '') => transliterate({
                    text,
                    language: learningLanguageCode,
                    fromScript: goesFromLatin.script2,
                    toScript: goesFromLatin.script1,
                })
            }
        });
    }
}