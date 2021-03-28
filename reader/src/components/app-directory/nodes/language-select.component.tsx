import React, {Fragment, useContext} from "react";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {Box, InputLabel, MenuItem, Select} from "@material-ui/core";
import {SupportedTranslationService} from "../../../lib/language/supported-translation.service";
import {readingLanguageSelect, spokenLanguageSelect} from "@shared/";

export const LanguageSelect = () => {
    const m = useContext(ManagerContext);
    const readingLanguageCode = useObservableState(m.settingsService.readingLanguage$) || '';
    const spokenLanguageCode = useObservableState(m.settingsService.spokenLanguage$) || '';
    const potentialSpokenLanguageCode = useObservableState(m.languageConfigsService.potentialLearningSpoken$) || [];
    return <Fragment>
        <Box m={2}>
            <InputLabel id="reading-language-select-label">Script</InputLabel>
            <Select
                variant={'filled'}
                labelId="reading-language-select-label"
                value={readingLanguageCode}
                onChange={e => m.settingsService.readingLanguage$.next(e.target.value as string)}
                inputProps={{
                    className: readingLanguageSelect
                }}
            >
                {
                    SupportedTranslationService
                        .SupportedTranslations
                        .map(c => <MenuItem value={c.code}>{c.label}</MenuItem>)
                }
            </Select>
        </Box>
        <Box m={2}>
            <InputLabel id="spoken-language-select-label">Spoken Language</InputLabel>
            <Select
                variant={'filled'}
                labelId="spoken-language-select-label"
                value={spokenLanguageCode}
                onChange={e => m.settingsService.spokenLanguage$.next(e.target.value as string)}
                inputProps={{
                    className: spokenLanguageSelect
                }}
            >
                {
                    potentialSpokenLanguageCode
                        .map(c => <MenuItem value={c.code}>{c.label}</MenuItem>)
                }
            </Select>
        </Box>
    </Fragment>
}