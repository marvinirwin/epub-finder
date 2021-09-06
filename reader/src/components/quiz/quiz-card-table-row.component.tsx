import { Button, TableCell, TableRow, Typography } from '@material-ui/core'
import { quizCardTableRow, quizCardTableRowWord } from '@shared/'
import { round } from 'lodash'
import React, { useContext } from 'react'
import { ManagerContext } from '../../App'
import { format, formatDistance } from 'date-fns'
import {SpacedScheduleRow} from "../../lib/manager/space-schedule-row.type";

export const QuizCardTableRow: React.FC<{
    row: SpacedScheduleRow
}> = ({ row }) => {
    const m = useContext(ManagerContext)
    return (
        <TableRow key={row.d.word} className={`${quizCardTableRow}`}>
            <TableCell
                component='th'
                scope='row'
                className={quizCardTableRowWord}
            >
                <Button
                    onClick={() =>
                        m.wordCardModalService.word$.next(row.d.word)
                    }
                >
                    <Typography variant={'h6'}>{row.d.word}</Typography>
                </Button>
            </TableCell>
            <TableCell>{formatDistance(row.dueDate(), Date.now())} </TableCell>
            <TableCell>
                {row.d.flash_card_type}
            </TableCell>
            <TableCell>
                {round(
                    row.d.sortValues.count.weightedInverseLogNormalValue || 0,
                    2,
                )}
            </TableCell>
            <TableCell>
                {round(
                    row.d.sortValues.length.weightedInverseLogNormalValue || 0,
                    2,
                )}{' '}
            </TableCell>
{/*
            <TableCell>
                {round(
                    row.d.sortValues.sentencePriority
                        .weightedInverseLogNormalValue || 0,
                    2,
                )}{' '}
            </TableCell>
*/}
            <TableCell>
                {
                    format(row.d.spacedDueDate.source, 'H:m:s')
                }
                <br/>
                {
                    format(row.d.spacedDueDate.transformed, 'H:m:s')
                }
            </TableCell>
        </TableRow>
    )
}
