import { TreeMenuNode } from '../tree-menu-node.interface'
import { CalendarTodayOutlined, Call } from '@material-ui/icons'
import React from 'react'
import {
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
} from '@material-ui/core'
import { TranslationAttemptScheduleData } from '../../../lib/schedule/translation-attempt-schedule.service'
import { ScheduleRow } from '../../../lib/schedule/schedule-row'
import { TranslationAttemptScheduleTable } from './translation-attempt-schedule-table.component'
import {
    TranslationAttemptDataTable,
} from '../../translation-attempt/translation-attempt.component'

const TranslationAttemptScheduleNode = 'TranslationAttemptScheduleNode'

export const TranslationAttemptTableHead: React.FC<{}> = () => {
    return (
        <TableHead>
            <TableRow>
                <TableCell>Text</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Next Due Date</TableCell>
            </TableRow>
        </TableHead>
    )
}

export const TranslationAttemptTableToolbar: React.FC<{}> = () => {
    return (
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
                Progress Made
            </Typography>
        </Toolbar>
    )
}

export const TranslationAttemptScheduleTableRow: React.FC<{
    scheduleRow: ScheduleRow<TranslationAttemptScheduleData>
}> = ({ scheduleRow }) => {
    return (
        <TableRow>
            <TableCell component="th" scope="row">
                <Typography variant={'h6'}>
                    {scheduleRow.d.segmentText}{' '}
                </Typography>
            </TableCell>
            <TableCell component="th" scope="row">
                <Typography>{scheduleRow.recognitionScore()} </Typography>
            </TableCell>
            <TableCell component="th" scope="row">
                <Typography>{scheduleRow.dueDate().toString()}</Typography>
            </TableCell>
        </TableRow>
    )
}

export const TranslationAttemptSchedule: TreeMenuNode = {
    name: TranslationAttemptScheduleNode,
    label: 'Translation Attempt Schedule',
    Component: TranslationAttemptScheduleTable,
    LeftIcon: () => <CalendarTodayOutlined />,
}
export const TranslationAttemptNode: TreeMenuNode = {
    name: TranslationAttemptScheduleNode,
    label: 'Translation Attempt Schedule',
    Component: () => <TranslationAttemptDataTable />,
    LeftIcon: () => <Call />,
}
