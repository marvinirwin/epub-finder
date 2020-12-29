import React, {useContext} from "react";
import {LinearProgress, ListItem} from "@material-ui/core";
import {ManagerContext} from "../../../App";

export const MonthlyProgressNode = {
    name: 'monthlyProgress',
    ReplaceComponent: () => {
        const m = useContext(ManagerContext);
        return <ListItem id={'monthly-progress'}>
            TODO
        </ListItem>
    }
}
