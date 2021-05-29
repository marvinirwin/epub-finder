import React from 'react'
import { WordRecognitionRow } from '../../lib/schedule/word-recognition-row'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { formatDueDate } from '../../lib/schedule/format-due-date'
import { SpacedScheduleRow } from '../../lib/manager/sorted-limit-schedule-rows.service'
import { SrmStates } from '../../lib/schedule/srm-state-change-records'
import { PotentialExcludedDbColumns } from '../../lib/schedule/indexed-rows.repository'

export const ScheduleRowTable: React.FC<{
    scheduleRow: SpacedScheduleRow
}> = ({ scheduleRow }) => {
    const getCorrespondingStateEvent = (recognitionRow: PotentialExcludedDbColumns<WordRecognitionRow>) => scheduleRow.stateChangeRecords.find(stateChangeRecord => stateChangeRecord.r === recognitionRow)
    return (
        <TableContainer component={Paper}>
            <Table size='small' aria-label='a dense table'>
                <TableHead>
                    <TableRow>
                        <TableCell>Grade</TableCell>
                        <TableCell align='right'>Next Due Date</TableCell>
                        <TableCell align='right'>Timestamp</TableCell>
                        <TableCell align='right'>Interval</TableCell>
                        <TableCell>Learning State Change</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {scheduleRow.d.wordRecognitionRecords.map((row) => {
                        const correspondingEvent = getCorrespondingStateEvent(row)
                        return (
                            <TableRow key={row.created_at.getTime()}>
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
                                <TableCell style={
                                    {
                                        backgroundColor: correspondingEvent &&
                                            stateEventColorMap.get(correspondingEvent.type),
                                    }
                                }>{correspondingEvent?.type}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const stateEventColorMap = new Map<SrmStates, string>(
    [
        [
            SrmStates.learned,
            'blue',
        ],
        [
            SrmStates.learned,
            'green',
        ],
        [
            SrmStates.reviewed,
            'orange',
        ],
    ],
)