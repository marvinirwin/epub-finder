import {Segment} from "./Atomized/segment";
import {combineLatest, ReplaySubject} from "rxjs";
import {SettingsService} from "../services/settings.service";
import {transliterate} from "./transliterate.service";
import {LanguageConfigsService} from "./language-configs.service";

export class ActiveSentenceService {
    activeSentence$ = new ReplaySubject<Segment>(1);

    constructor(
        {
            settingsService,
            languageConfigsService
        }: {
            settingsService: SettingsService
            languageConfigsService: LanguageConfigsService
        }) {
        combineLatest([
            this.activeSentence$,
            settingsService.showTranslation$,
            settingsService.showRomanization$,
            languageConfigsService.learningToKnownTranslate$,
            languageConfigsService.learningToLatinTransliterate$

        ]).subscribe(async (
            [
                activeSentence,
                showTranslations,
                showRomanization,
                learningToKnownTranslateFn,
                learningToLatinFn
            ]
        ) => {
            if (activeSentence?.popperElement) {
                const els = [
                    showRomanization && learningToLatinFn &&
                    await learningToLatinFn(activeSentence.translatableText || ''),
                    showTranslations && learningToKnownTranslateFn &&
                    await learningToKnownTranslateFn(activeSentence.translatableText || ''),
                ].filter(v => v)
                // @ts-ignore
                activeSentence.popperElement.innerHTML = `${els.join(`</br></br>`)}`
            }
        })
    }

}