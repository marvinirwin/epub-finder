import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {format} from "date-fns";
import {round} from "lodash";

export const QuizCardScheduleTable = () => {
    const m = useContext(ManagerContext);
    const rows = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)
        ?.limitedScheduleRows || []
    return <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Word</TableCell>
                    <TableCell align="right">DueDate</TableCell>
                    {/*
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Sentence Priority</TableCell>
                    <TableCell align="right">Length</TableCell>
*/}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.slice(0, 3).map((row) => (
                    <TableRow key={row.d.word}>
                        <TableCell component="th" scope="row">
                            {row.d.word}
                        </TableCell>
                        <TableCell align="right">
                            {format(row.dueDate(), "yyyy MMM-do HH:mm")} &nbsp;
                            {round(row.d.sortValues.dueDate.weightedInverseLogNormalValue, 2)}
                        </TableCell>
                        {/*
                        <TableCell align="right">
                            {row.d.sortValues.count.value}&nbsp;
                            {round(row.d.sortValues.count.weightedInverseLogNormalValue, 2)}
                        </TableCell>
                        <TableCell align="right">
                            {row.d.sortValues.sentencePriority.value}&nbsp;
                            {round(row.d.sortValues.sentencePriority.weightedInverseLogNormalValue, 2)}
                        </TableCell>
                        <TableCell align="right">
                            {row.d.sortValues.length.value}&nbsp;
                            {round(row.d.sortValues.length.weightedInverseLogNormalValue, 2)}
                        </TableCell>
*/}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}