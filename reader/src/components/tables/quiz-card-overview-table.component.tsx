import React, {useContext, Fragment} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {format} from "date-fns";
import {round} from "lodash";

export const QuizCardScheduleTable = () => {
    const m = useContext(ManagerContext);
    const groupedScheduleRows = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$);
    return <Fragment>
    </Fragment>
}
