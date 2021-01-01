import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {FormControlLabel, ListItem, Switch} from "@material-ui/core";

export const TogglePinyin = () => {
    const m = useContext(ManagerContext);
    const showPinyin = useObservableState(m.settingsService.showPinyin$)
    return <ListItem>
        <FormControlLabel
            control={
                <Switch checked={!!showPinyin}
                        onChange={() => m.settingsService.showPinyin$.next(!showPinyin)}
                />}
            label="Show Pinyin"/>
    </ListItem>
}