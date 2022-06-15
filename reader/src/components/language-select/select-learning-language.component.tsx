import { SupportedSpeechToTextService } from "../../../../server/src/shared/supported-speech-to-text.service";
import { ManagerContext } from "../../App";
import React, { useContext } from "react";
import { useObservableState } from "observable-hooks";
import { SelectLearningLanguageBase } from "./select-learning-language.base";

export const SelectLearningLanguage = () => {
    const m = useContext(ManagerContext)
    const allLanguages = SupportedSpeechToTextService.Configs
    const lang = useObservableState(m.settingsService.readingLanguage$) || ''
    return <SelectLearningLanguageBase options={allLanguages} value={lang} onChange={languageCode => m.settingsService.readingLanguage$.next(languageCode) }/>
}

