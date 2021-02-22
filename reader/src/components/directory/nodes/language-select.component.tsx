import React, {Fragment, useContext} from "react";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {InputLabel, MenuItem, Select} from "@material-ui/core";
import {SupportedTranslationService} from "../../../lib/supported-translation.service";

export const LanguageSelect = () => {
    const m = useContext(ManagerContext);
    const readingLanguageCode = useObservableState(m.settingsService.readingLanguage$) || '';
    const spokenLanguageCode = useObservableState(m.settingsService.spokenLanguage$) || '';
    const potentialSpokenLanguageCode = useObservableState(m.languageConfigsService.potentialLearningSpoken$) || [];
    return <Fragment>
        <InputLabel id="reading-language-select-label">Script</InputLabel>
        <Select
            labelId="reading-language-select-label"
            value={readingLanguageCode}
            onChange={e => m.settingsService.readingLanguage$.next(e.target.value as string)}
            style={{margin: '24px'}}
        >
            {
                SupportedTranslationService
                    .SupportedTranslations
                    .map(c => <MenuItem value={c.code}>{c.label}</MenuItem>)
            }
        </Select>
        <InputLabel id="spoken-language-select-label">Spoken Language</InputLabel>
        <Select
            labelId="spoken-language-select-label"
            value={spokenLanguageCode}
            style={{margin: '24px'}}
            onChange={e => m.settingsService.spokenLanguage$.next(e.target.value as string)}
        >
            {
                potentialSpokenLanguageCode
                    .map(c => <MenuItem value={c.code}>{c.label}</MenuItem>)
            }
        </Select>
    </Fragment>
}