import {Segment} from "./Atomized/segment";
import {combineLatest, ReplaySubject} from "rxjs";
import {SettingsService} from "../services/settings.service";
import {fetchTranslation} from "../services/translate.service";
import {fetchPinyin} from "./pinyin.service";

export class ActiveSentenceService {
    activeSentence$ = new ReplaySubject<Segment>(1);

    constructor(
        {
            settingsService
        }: {
            settingsService: SettingsService
        }) {
        combineLatest([
            this.activeSentence$,
            settingsService.showTranslations$,
            settingsService.showPinyin$
        ]).subscribe(async (
            [activeSentence, showTranslations, showPinyin]
        ) => {
            if (activeSentence?.popperElement) {
                const els = [
                    showTranslations && await fetchTranslation(activeSentence.translatableText),
                    showPinyin && await fetchPinyin(activeSentence.translatableText)
                ].filter(v => v)
                // @ts-ignore
                activeSentence.popperElement.innerHTML = `${els.join(`</br></br>`)}`
            }
        })
    }

}