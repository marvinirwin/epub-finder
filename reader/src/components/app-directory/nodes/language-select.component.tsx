import React, { Fragment, useContext } from 'react'
import { ManagerContext } from '../../../App'
import { useObservableState } from 'observable-hooks'
import { Box, InputLabel, MenuItem, Select } from '@material-ui/core'
import { SupportedTranslationService } from '../../../lib/language/supported-translation.service'
import {
    readingLanguageSelect,
    spokenLanguageSelect,
    textToSpeechLanguageSelectLabel,
    textToSpeechSelect,
} from '@shared/'

export const LanguageSelect = () => {
    const m = useContext(ManagerContext)
    const readingLanguageCode =
        useObservableState(m.settingsService.readingLanguage$) || ''
    const spokenLanguageCode =
        useObservableState(m.settingsService.spokenLanguage$) || ''
    const potentialSpokenLanguageCode =
        useObservableState(m.languageConfigsService.potentialLearningSpoken$) ||
        []
    const potentialTextToSpeech = useObservableState(m.languageConfigsService.potentialLearningLanguageTextToSpeechConfigs$) || []
    const chosenTextToSpeechConfig = useObservableState(m.settingsService.textToSpeechConfiguration$);
    return (
        <Fragment>
            <Box m={2} p={1}>
                <InputLabel id='reading-language-select-label'>
                    Reading Language
                </InputLabel>
                <Select
                    variant={'filled'}
                    labelId='reading-language-select-label'
                    value={readingLanguageCode}
                    onChange={(e) =>
                        m.settingsService.readingLanguage$.next(
                            e.target.value as string,
                        )
                    }
                    inputProps={{
                        className: readingLanguageSelect,
                    }}
                >
                    {SupportedTranslationService.SupportedTranslations.map(
                        (c) => (
                            <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>
                        ),
                    )}
                </Select>
            </Box>
            <Box m={2} p={1}>
                <InputLabel id='spoken-language-select-label'>
                    Spoken Language
                </InputLabel>
                <Select
                    variant={'filled'}
                    labelId='spoken-language-select-label'
                    value={spokenLanguageCode}
                    onChange={(e) =>
                        m.settingsService.spokenLanguage$.next(
                            e.target.value as string,
                        )
                    }
                    inputProps={{
                        className: spokenLanguageSelect,
                    }}
                >
                    {potentialSpokenLanguageCode.map((c) => (
                        <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>
                    ))}
                </Select>
            </Box>
            <Box m={2} p={1}>
                <InputLabel id={textToSpeechLanguageSelectLabel}>
                    Text to Speech Voice
                </InputLabel>
                <Select
                    variant={'filled'}
                    labelId={textToSpeechLanguageSelectLabel}
                    value={chosenTextToSpeechConfig?.voice || ''}
                    onChange={(e) =>
                        m.settingsService.textToSpeechConfiguration$.next(
                            potentialTextToSpeech.find(potentialConfig => potentialConfig.voice === e.target.value)
                        )
                    }
                    inputProps={{
                        className: textToSpeechSelect,
                    }}
                >
                    {potentialTextToSpeech.map((c) => (
                        <MenuItem key={c.voice} value={c.voice}>{c.voice}</MenuItem>
                    ))}
                </Select>
            </Box>
        </Fragment>
    )
}
