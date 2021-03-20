import {NormalizedQuizCardScheduleRowData, ScheduleRow} from "../../lib/schedule/schedule-row";
import {Button, TableCell, TableRow, Typography} from "@material-ui/core";
import {
    quizCardTableRow,
    quizCardTableRowCounts,
    quizCardTableRowLastAnswer,
    quizCardTableRowRecognitions,
    quizCardTableRowWord
} from "@shared/";
import {round, sum} from "lodash";
import {lastN} from "./last-n";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {formatDistance} from "date-fns";

export const QuizCardTableRow: React.FC<{ row: ScheduleRow<NormalizedQuizCardScheduleRowData> }> = ({row}) => {
    const m = useContext(ManagerContext);
    return (
        <TableRow
            key={row.d.word}
            className={`${quizCardTableRow}`}
        >
            <TableCell
                component="th"
                scope="row"
                className={quizCardTableRowWord}
            >
                <Button
                    onClick={() => m.wordCardModalService.word$.next(row.d.word)}
                >
                    <Typography variant={'h6'}>{row.d.word}</Typography>
                </Button>
            </TableCell>
            <TableCell>{formatDistance(row.dueDate(), Date.now())} </TableCell>
            <TableCell>{round(row.d.sortValues.dueDate.weightedInverseLogNormalValue || 0, 2)}</TableCell>
            <TableCell>{round(row.d.sortValues.count.weightedInverseLogNormalValue || 0, 2)}</TableCell>
            <TableCell>{round(row.d.sortValues.length.weightedInverseLogNormalValue || 0, 2)} </TableCell>
            <TableCell>{round(row.d.sortValues.sentencePriority.weightedInverseLogNormalValue || 0, 2)} </TableCell>
        </TableRow>

    );
}