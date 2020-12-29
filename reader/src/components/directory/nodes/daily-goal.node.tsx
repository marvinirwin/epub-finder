import React, {useContext} from "react";
import {LinearProgress, ListItem, Typography} from "@material-ui/core";
import {ManagerContext} from "../../../App";
import {useObservableState} from "observable-hooks";

export const DailyGoalNode = {
    name: 'dailyGoal',
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        const [goal, current] = useObservableState(m.goalsService.dailyGoalFraction$) || [0, 0];
        // Divide by zero error below?
        return <ListItem>
            <Typography id={'daily-goal-label'}>Daily Progress: {goal} / {current}</Typography>
            <LinearProgress style={{marginTop: '5px', marginBottom: '5px'}} variant='determinate' value={goal / current}/>
        </ListItem>
    }
}