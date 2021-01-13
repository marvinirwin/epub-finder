import {Settings} from '@material-ui/icons'
import React, {useContext, Fragment} from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {InputLabel, ListItem, MenuItem, Select} from "@material-ui/core";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {LanguageConfigsService} from "../../../lib/language-configs.service";
import {SupportedSpeechToTextService} from "../../../lib/supported-speech-to-text.service";
import {SupportedTranslationService} from "../../../lib/supported-translation.service";

export const LanguageSelectNode = {
    name: 'language-select',
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        const readingLanguageCode = useObservableState(m.settingsService.readingLanguage$) || '';
        const spokenLanguageCode = useObservableState(m.settingsService.spokenLanguage$);
        const potentialSpokenLanguageCode = useObservableState(m.languageConfigsService.potentialLearningSpoken$) || [];
        return <Fragment>
            <ListItem>
                <InputLabel id="reading-language-select-label">Script</InputLabel>
                <Select
                    labelId="reading-language-select-label"
                    value={readingLanguageCode}
                    onChange={e => m.settingsService.readingLanguage$.next(e.target.value as string)}
                >
                    {
                        SupportedTranslationService
                            .SupportedTranslations
                            .map(c => <MenuItem value={c.code}>{c.label}</MenuItem>)
                    }
                </Select>
            </ListItem>
            <ListItem>
                <InputLabel id="spoken-language-select-label">Spoken Language</InputLabel>
                <Select
                    labelId="spoken-language-select-label"
                    value={spokenLanguageCode}
                    onChange={e => m.settingsService.spokenLanguage$.next(e.target.value as string)}
                >
                    {
                        potentialSpokenLanguageCode
                            .map(c => <MenuItem value={c.code}>{c.label}</MenuItem>)
                    }
                </Select>
            </ListItem>
        </Fragment>
    },
    moveDirectory: true
} as TreeMenuNode