import React, {Fragment, useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {FormControlLabel, Input, ListItem, MenuItem, Select, Switch, TextField} from "@material-ui/core";
import {LtDocument, newWordLimitInput} from "@shared/";

export const SetQuizWordLimit = () => {
    const m = useContext(ManagerContext);
    const selectedQuizWordLimit = useObservableState(m.settingsService.newQuizWordLimit$);
    return <TextField
        type="number"
        value={selectedQuizWordLimit}
        onChange={e => m.settingsService.newQuizWordLimit$.next(
            parseInt(e.target.value || '', 10) || 10
        )}
        InputLabelProps={{
            shrink: true,
            id: newWordLimitInput
        }}
    />
}
