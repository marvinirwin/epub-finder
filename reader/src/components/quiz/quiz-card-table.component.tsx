import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {Table, TableContainer, TableHead, TableRow, TableCell, Paper, TableBody, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {QuizCardTableHead} from "./quiz-card-table-head.component";
import {QuizCardTableRow} from "./quiz-card-table-row.component";


export const QuizCardTableComponent = () => {
    const m = useContext(ManagerContext);
    const scheduleRows = useObservableState(m.scheduleManager.sortedScheduleRows$) || [];
    return <TableContainer component={Paper}>
        <Table aria-label="simple table">
            <QuizCardTableHead/>
            <TableBody>
                {scheduleRows.slice(0, 100).map(row => <QuizCardTableRow row={row} key={row.d.word}/>)}
            </TableBody>
        </Table>
    </TableContainer>
}