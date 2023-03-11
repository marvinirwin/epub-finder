import React, { useContext, useEffect, useState } from 'react'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@material-ui/core'
import { format } from 'date-fns'
import { useCancellablePromise } from '../../lib/manager/AudioManager'
import {fetchTranslation, fetchTranslationWithGrammarHints} from '../../services/translate.service'
import { TranslationAttemptScheduleData } from '../../lib/schedule/translation-attempt-schedule.service'
import { ScheduleRow } from '../../lib/schedule/schedule-row'

export const useTranslation = (segmentText: string | undefined) => {
    const m = useContext(ManagerContext)
    const languageConfig = useObservableState(
        m.languageConfigsService.learningToKnownTranslateConfig$,
    )
    const { cancellablePromise } = useCancellablePromise()
    const [translation, setTranslation] = useState('')
    useEffect(() => {
        if (languageConfig && segmentText) {
            cancellablePromise(
                fetchTranslationWithGrammarHints({ ...languageConfig, text: segmentText }),
            ).then(setTranslation)
        }
    }, [segmentText, languageConfig])
    return translation
}

export const TranslationAttemptScheduleRow: React.FC<{
    row: ScheduleRow<TranslationAttemptScheduleData>
}> = ({ row }) => {
    const translation = useTranslation(row?.d?.segmentText)
    return (
        <TableRow>
            <TableCell component="th" scope="row">
                {translation}
            </TableCell>
        </TableRow>
    )
}

export const QuizCardTranslationAttemptSchedule = () => {
    const m = useContext(ManagerContext)
    const rows = Object.values(
        useObservableState(
            m.translationAttemptScheduleService.scheduleRows$,
        ) || {},
    )

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Sentence</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.slice(0, 3).map((row) => {
                        return <TranslationAttemptScheduleRow key={row.d.segmentText} row={row} />
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
