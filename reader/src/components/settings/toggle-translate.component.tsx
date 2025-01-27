import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { FormControlLabel, ListItem, Switch } from '@material-ui/core'

export const ToggleTranslateComponent = () => {
    const m = useContext(ManagerContext)
    const showTranslations = useObservableState(
        m.settingsService.showTranslation$.obs$,
    )
    return (
        <ListItem>
            <FormControlLabel
                control={
                    <Switch
                        checked={!!showTranslations}
                        onChange={() =>
                            m.settingsService.showTranslation$.user$.next(
                                !showTranslations,
                            )
                        }
                    />
                }
                label="Show Translations"
            />
        </ListItem>
    )
}
