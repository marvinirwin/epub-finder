import { SupportedSpeechToTextService } from "../../../../server/src/shared/supported-speech-to-text.service";
import { ManagerContext } from "../../App";
import React, { useContext, useState } from "react";
import { useObservableState } from "observable-hooks";
import { SelectLearningLanguageBase } from "./select-learning-language.base";
import { useVisibleObservableState } from "../UseVisilbleObservableState/UseVisibleObservableState";
import { EmittedValuesWithRef } from "../UseVisilbleObservableState/EmittedValuesWithRef.component";

export const SelectLearningLanguage = () => {
    const m = useContext(ManagerContext)
    const allLanguages = SupportedSpeechToTextService.Configs;
    const lang = useObservableState(m.settingsService.readingLanguage$) || '';
    const emittedSelectedReadingLanguages = useVisibleObservableState(m.settingsService.readingLanguage$, (str: string) => `m.settingsService.readingLanguage$: ${str}`);
    const [ref, setRef] = useState<HTMLSelectElement | null>(null);
    return <>
        <EmittedValuesWithRef ref={ref} emittedValues={emittedSelectedReadingLanguages}/>
        <SelectLearningLanguageBase options={allLanguages} value={lang} onChange={languageCode => m.settingsService.readingLanguage$.next(languageCode) } ref={setRef}/>
    </>
}

