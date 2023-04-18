import React, {useContext} from 'react'
import {ManagerContext} from '../../App'
import {useObservableState} from 'observable-hooks'
import {FormControlLabel, ListItem, Switch} from '@material-ui/core'
import { Subject} from "rxjs";
import {Manager} from "../../lib/manager/Manager";
import {SettingObject} from "../../services/settings.service";


const s = "Show Romanization";
export const ToggleSettingComponent = ( cb: (m: Manager) => { setting: SettingObject<boolean>, label: string }): React.FC => () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const m = useContext(ManagerContext)
    const {label, setting} = cb(m);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const showPinyin = useObservableState(setting.obs$);
    return (
        <ListItem>
            <FormControlLabel
                control={
                    <Switch
                        checked={!!showPinyin}
                        onChange={() =>
                            setting.user$.next(
                                !showPinyin,
                            )
                        }
                    />
                }
                label={label}
            />
        </ListItem>
    )
}

export const TogglePinyinComponent = ToggleSettingComponent(m => ({label: "Show Romanization", setting: m.settingsService.showRomanization$}))
export const ToggleShowSoundQuizCard = ToggleSettingComponent(m => ({label: "Show Sound Quiz Card", setting: m.settingsService.showSoundQuizCard$}))
