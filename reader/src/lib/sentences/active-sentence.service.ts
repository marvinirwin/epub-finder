import {Segment} from "@shared/";
import {combineLatest, ReplaySubject} from "rxjs";
import {SettingsService} from "../../services/settings.service";
import {LanguageConfigsService} from "../language/language-configs.service";

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
            languageConfigsService.learningToKnownTranslateConfig$,
            languageConfigsService.learningToLatinTransliterateFn$

        ]).subscribe(async (
            [
                activeSentence,
                showTranslations,
                showRomanization,
                learningToKnownTranslateFn,
                learningToLatinFn
            ]
        ) => {
        })
    }

}