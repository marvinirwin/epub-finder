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

export const AdjustLengthWeight = () => {
    const m = useContext(ManagerContext)
    const wordLengthWeight =
        useObservableState(m.settingsService.wordLengthWeight$.obs$) || 0
    return (
        <ListItem>
            <Typography gutterBottom>
                How much word length influences the flashcard order
            </Typography>
            <Slider
                value={wordLengthWeight}
                onChange={(_, value) => {
                    m.settingsService.wordLengthWeight$.user$.next(value as number)
                }}
                step={0.1}
                marks
                min={0}
                max={1}
            />
        </ListItem>
    )
}
