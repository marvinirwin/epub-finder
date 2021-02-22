import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {FormControlLabel, ListItem, Switch} from "@material-ui/core";

export const TogglePinyinComponent = () => {
    const m = useContext(ManagerContext);
    const showPinyin = useObservableState(m.settingsService.showRomanization$)
    return <ListItem>
        <FormControlLabel
            control={
                <Switch checked={!!showPinyin}
                        onChange={() => m.settingsService.showRomanization$.next(!showPinyin)}
                />}
            label="Show Pinyin"
        />
    </ListItem>
}