import {SupportedSpeechToTextService} from "../lib/supported-speech-to-text.service";
import {List, ListItem, Select, MenuItem} from "@material-ui/core";
import {ManagerContext} from "../App";
import {useContext} from "react";
import React from "react";
import {useObservableState} from "observable-hooks";

export const SelectLearningLanguage = () => {
    const m =useContext(ManagerContext);
    const allLanguages = SupportedSpeechToTextService.Configs;
    const lang = useObservableState(m.settingsService.readingLanguage$) || '';
    return <Select
        id='#speech-practice-learning-language'
        value={lang}
        onChange={ev => { m.settingsService.readingLanguage$.next(ev.target.value as string) }
        }>
        {
            allLanguages.map(
                language => <MenuItem value={language.code}>
                    {language.label}
                </MenuItem>
            )
        }
    </Select>
}