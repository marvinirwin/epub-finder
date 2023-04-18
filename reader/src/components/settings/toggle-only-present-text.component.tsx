import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { FormControlLabel, ListItem, Switch } from '@material-ui/core'

export const ToggleOnlyPresentText = () => {
    const m = useContext(ManagerContext)
    const onlyShowPresentText = useObservableState(m.settingsService.onlyReviewPresentText$.obs$)
    return (
        <ListItem>
            <FormControlLabel
                control={
                    <Switch
                        checked={!!onlyShowPresentText}
                        onChange={() =>
                            m.settingsService.onlyReviewPresentText$.user$.next(!onlyShowPresentText)
                        }
                    />
                }
                label="Only review words which are present in the selected homework"
            />
        </ListItem>
    )
}
