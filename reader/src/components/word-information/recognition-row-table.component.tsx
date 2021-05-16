import React from 'react'
import { WordRecognitionRow } from '../../lib/schedule/word-recognition-row'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { formatDueDate } from '../../lib/schedule/format-due-date'

export const RecognitionRowTableComponent: React.FC<{
    wordRecognitionRows: WordRecognitionRow[],
}> = ({ wordRecognitionRows }) => {
    return (
        <TableContainer component={Paper}>
            <Table size='small' aria-label='a dense table'>
                <TableHead>
                    <TableRow>
                        <TableCell>Grade</TableCell>
                        <TableCell align='right'>Next Due Date</TableCell>
                        <TableCell align='right'>Timestamp</TableCell>
                        <TableCell align='right'>Interval</TableCell>
                        <TableCell align='right'>Flash Card Type</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {wordRecognitionRows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell component='th' scope='row'>
                                {row.grade}
                            </TableCell>
                            <TableCell align='right'>
                                {formatDueDate(row.nextDueDate || new Date())}
                            </TableCell>
                            <TableCell align='right'>
                                {formatDueDate(row.created_at || new Date())}
                            </TableCell>
                            <TableCell align='right'>{row.interval}</TableCell>
                            <TableCell align='right'>{row.flash_card_type}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}