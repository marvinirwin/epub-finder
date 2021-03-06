import {Segment} from "../../../server/src/shared/tabulate-documents/segment";
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
            languageConfigsService.learningToKnownTranslateFn$,
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