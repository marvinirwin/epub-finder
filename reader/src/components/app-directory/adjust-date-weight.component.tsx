import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import {
    FormControlLabel,
    ListItem,
    Slider,
    Switch,
    Typography,
} from '@material-ui/core'

export const AdjustDateWeight = () => {
    const m = useContext(ManagerContext)
    const dateWeight = useObservableState(m.settingsService.dateWeight$) || 0
    return (
        <ListItem>
            <Typography gutterBottom>
                How much Due Date influences the flashcard order
            </Typography>
            <Slider
                value={dateWeight}
                onChange={(_, value) => {
                    m.settingsService.dateWeight$.next(value as number)
                }}
                step={0.1}
                marks
                min={0}
                max={1}
            />
        </ListItem>
    )
}
export const AdjustTranslationAttemptSentenceWeight = () => {
    const m = useContext(ManagerContext)
    const dateWeight =
        useObservableState(
            m.settingsService.translationAttemptSentenceWeight$,
        ) || 0
    return (
        <ListItem>
            <Typography gutterBottom>
                How much being included in the first translation attempt
                sentence influence the flash card order
            </Typography>
            <Slider
                value={dateWeight}
                onChange={(_, value) => {
                    m.settingsService.translationAttemptSentenceWeight$.next(
                        value as number,
                    )
                }}
                step={0.1}
                marks
                min={0.1}
                max={1}
            />
        </ListItem>
    )
}
