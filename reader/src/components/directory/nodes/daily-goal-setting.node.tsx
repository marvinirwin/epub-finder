import {TreeMenuNode} from "../tree-menu-node.interface";
import {ManagerContext} from "../../../App";
import React, {useCallback, useContext} from "react";
import {Input, ListItem, TextField} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {debounce} from 'lodash';

export const DailyGoalSettingNode = {
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        const dailyGoal = useObservableState(m.settingsService.dailyGoal$) || 0;
        const onInputChanged = useCallback(
            debounce(
                (n: number) => {
                    m.settingsService.dailyGoal$.next(n)
                },
                500
            ),
            []
        );
        return <ListItem>
            <TextField
                label={`Daily Goal`}
                id={'daily-goal-input'}
                value={dailyGoal}
                onChange={ev => onInputChanged(parseInt(ev.target.value) || 0)}>

            </TextField>
        </ListItem>
    },
    name: 'dailyGoalSetting'
} as TreeMenuNode;