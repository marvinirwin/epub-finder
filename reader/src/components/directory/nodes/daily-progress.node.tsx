import React, {useContext} from "react";
import {LinearProgress, ListItem, Typography} from "@material-ui/core";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";

export const DailyProgressNode = {
    name: 'dailyProgress',
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        const [goal, current] = useObservableState(m.goalsService.dailyProgressFraction$) || [0, 0];
        // Divide by zero error below?
        return <ListItem id={'daily-progress'}>
            <Typography>Daily Progress: {goal} / {current}</Typography>
            <LinearProgress variant='determinate' value={goal / current}/>
        </ListItem>
    }
}