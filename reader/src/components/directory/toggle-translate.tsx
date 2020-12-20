import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {FormControlLabel, ListItem, Switch} from "@material-ui/core";

export const ToggleTranslate = () => {
    const m = useContext(ManagerContext);
    const showTranslations = useObservableState(m.settingsService.showTranslations$)
    return <ListItem>
        <FormControlLabel
            control={
                <Switch checked={!!showTranslations}
                        onChange={() => m.settingsService.showTranslations$.next(!showTranslations)}
                />}
            label="Show Translations"/>
    </ListItem>
}