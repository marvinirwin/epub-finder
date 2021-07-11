import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { FormControlLabel, ListItem, Switch } from '@material-ui/core'

export const ToggleOnlyPresentText = () => {
    const m = useContext(ManagerContext)
    const onlyShowPresentText = useObservableState(m.settingsService.onlyReviewPresentText$)
    return (
        <ListItem>
            <FormControlLabel
                control={
                    <Switch
                        checked={!!onlyShowPresentText}
                        onChange={() =>
                            m.settingsService.onlyReviewPresentText$.next(!onlyShowPresentText)
                        }
                    />
                }
                label="Only review words which are present in the selected homework"
            />
        </ListItem>
    )
}
