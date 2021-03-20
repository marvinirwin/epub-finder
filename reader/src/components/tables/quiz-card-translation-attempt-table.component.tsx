import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {format} from "date-fns";

export const QuizCardTranslationAttemptSchedule = () => {
    const m = useContext(ManagerContext);
    const rows = Object.values(useObservableState(m.translationAttemptScheduleService.indexedScheduleRows$) || {});

    return <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Sentence</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.slice(0, 3).map((row) => (
                    <TableRow key={row.d.segmentText}>
                        <TableCell component="th" scope="row">
                            {row.d.segmentText.substr(0, 10)}
                        </TableCell>
                        <TableCell align="right">
                            {format(row.dueDate(), 'yyyy MMM-do HH:mm')}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}