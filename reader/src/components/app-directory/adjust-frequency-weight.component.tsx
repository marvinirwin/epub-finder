import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {FormControlLabel, ListItem, Slider, Switch, Typography} from "@material-ui/core";

export const AdjustFrequencyWeight = () => {
    const m = useContext(ManagerContext);
    const frequencyWeight = useObservableState(m.settingsService.frequencyWeight$) || 0;
    return <ListItem>
        <Typography gutterBottom>
            How much word frequency influences the flashcard order
        </Typography>
        <Slider
            value={frequencyWeight}
            onChange={(_, value) => {
                m.settingsService.frequencyWeight$.next(value as number);
            }}
            step={.1}
            marks
            min={0.1}
            max={1}
        />
    </ListItem>
}