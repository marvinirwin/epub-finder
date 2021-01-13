import {Settings} from '@material-ui/icons'
import React, {useContext} from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";
import {InputLabel, ListItem, MenuItem, Select} from "@material-ui/core";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";
import {LanguageConfigsService} from "../../../lib/language-configs.service";
import {SupportedSpeechToTextService} from "../../../lib/supported-speech-to-text.service";
import {SupportedTranslationService} from "../../../lib/supported-translation.service";

export const SettingsNode = {
    name: 'language-select',
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        const langCode = useObservableState(m.settingsService.learningLanguage$) || '';
        return <ListItem>
            <InputLabel id="language-select-label">Age</InputLabel>
            <Select
                labelId="language-select-label"
                value={langCode}
                onChange={e => m.settingsService.learningLanguage$.next(e.target.value as string)}
            >
                {
                    SupportedTranslationService
                        .SupportedTranslations
                        .map(c => <MenuItem value={c.code}>{c.label}</MenuItem>)
                }
            </Select>
        </ListItem>
    },
    moveDirectory: true
} as TreeMenuNode