import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Paper,
    TableBody,
    Typography,
    Toolbar, TextField
} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {QuizCardTableHead} from "./quiz-card-table-head.component";
import {QuizCardTableRow} from "./quiz-card-table-row.component";
import { filterScheduleRows } from "@shared/";
import {QuizCardTableToolbar} from "./quiz-card-table-toolbar.component";


export const QuizCardTableComponent = () => {
    const m = useContext(ManagerContext);
    const scheduleRows = useObservableState(m.filterScheduleTableRowsService.filteredScheduleRows$) || [];
    return <div>
        <QuizCardTableToolbar/>
        <TableContainer component={Paper}>
        <Table>
            <QuizCardTableHead/>
            <TableBody>
                {scheduleRows.slice(0, 100).map(row => <QuizCardTableRow row={row} key={row.d.word}/>)}
            </TableBody>
        </Table>
        </TableContainer>
    </div>
}