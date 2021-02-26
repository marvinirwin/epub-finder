import {TextField, Toolbar, Typography} from "@material-ui/core";
import {filterScheduleRows} from "@shared/";
import React, {useContext} from "react";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../../App";

export const QuizCardTableToolbar = () => {
    const m = useContext(ManagerContext);
    const filterValue = useObservableState(m.settingsService.scheduleTableWordFilterValue$) || ''
    return <Toolbar style={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h6" component="div">
            Quiz Schedule
        </Typography>
        <TextField
            value={filterValue}
            onChange={v => m.settingsService.scheduleTableWordFilterValue$.next(v.target.value)}
            id={filterScheduleRows}
            label="Filter by Word"
        />
    </Toolbar>
}