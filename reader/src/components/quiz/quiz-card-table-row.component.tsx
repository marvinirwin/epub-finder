import {NormalizedScheduleRowData, ScheduleRow} from "../../lib/schedule/schedule-row";
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

export const QuizCardTableRow: React.FC<{ row: ScheduleRow<NormalizedScheduleRowData> }> = ({row}) => {
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
            <TableCell>
                Due Date: {round(row.d.dueDate.weightedInverseLogNormalValue || 0, 2)}
                <br/>
                Due Date Normal: {round(row.d.dueDate.normalValue || 0, 2)}
                <br/>
                Count: {round(row.d.count.weightedInverseLogNormalValue || 0, 2)}
                <br/>
                Length: {round(row.d.length.weightedInverseLogNormalValue || 0, 2)}
                <br/>
                Length Weight: {round(row.d.length.weight || 0, 2)}
            </TableCell>
            <TableCell>
                {`${row.dueIn()} ${+row.dueDate() < 0 ? ' ago' : ''}`}
            </TableCell>
            <TableCell
                className={quizCardTableRowRecognitions}
            >{
                lastN(1)(row.d.wordRecognitionRecords)
                    .map(r => `${r.grade}`)
                    .join(',')
            }
            </TableCell>
            <TableCell
                className={quizCardTableRowCounts}
            >{
                sum(row.d.wordCountRecords.map(r => r.count)) || 0
            }</TableCell>
            <TableCell
                className={quizCardTableRowLastAnswer}
            >{
                lastN(1)(row.d.pronunciationRecords)
                    .map(r => `${r.success ? 'Correct' : ''}`)
                    .join(',')
            }</TableCell>
        </TableRow>

    );
}