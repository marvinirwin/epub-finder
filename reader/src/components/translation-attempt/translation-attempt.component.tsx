import React, { Fragment, useContext, useEffect, useState } from 'react'
import { ManagerContext } from '../../App'
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@material-ui/core'
import { useObservableState, useSubscription } from 'observable-hooks'
import { SuperMemoGrade } from 'supermemo'
import { SrmService } from '../../lib/srm/srm.service'
import moment from 'moment'
import { Observable } from 'rxjs'
import { DifficultyButtons } from './difficulty-buttons.component'
import { sumWordCountRecords } from '../../lib/schedule/schedule-math.service'
import {
    averageKnownWords,
    AverageResult,
    wordsFromCountRecordList,
} from '../../../../server/src/shared/tabulation/word-count-records.module'
import { sum, round } from 'lodash'
import { TranslationAttemptScheduleData } from '../../lib/schedule/translation-attempt-schedule.service'
import { ScheduleRow } from '../../lib/schedule/schedule-row'
import { useTranslation } from '../tables/quiz-card-translation-attempt-table.component'
import { AdvanceButton } from '../quiz/advance.button.component'

export const translateRequest = ''

export const useTranslationAttemptDifficulty = (
    r: ScheduleRow<TranslationAttemptScheduleData>,
) => {
    const m = useContext(ManagerContext)
    const weightedVocab = useObservableState(
        m.weightedVocabService.weightedVocab$,
    )
    const [data, setData] = useState<AverageResult | undefined>()
    useEffect(() => {
        if (weightedVocab) {
            setData(
                averageKnownWords(
                    wordsFromCountRecordList(r.d.wordCountRecords),
                    weightedVocab,
                ),
            )
        }
    }, [weightedVocab, r])

    return data
}

const TranslationAttemptDataTableRow: React.FC<{
    row: ScheduleRow<TranslationAttemptScheduleData>
}> = ({ row }) => {
    const translation = useTranslation(row.d.segmentText)
    const difficultyData = useTranslationAttemptDifficulty(row)
    return (
        <TableRow>
            <TableCell>{translation}</TableCell>
            <TableCell>
                {Array.from(difficultyData?.known || []).join(', ')}
            </TableCell>
            <TableCell>
                {Array.from(difficultyData?.unknown || []).join(', ')}
            </TableCell>
            <TableCell>{round(difficultyData?.average || 0, 2)}</TableCell>
        </TableRow>
    )
}

export const TranslationAttemptDataTable = () => {
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
                        <TableCell>English</TableCell>
                        <TableCell>KnownWords</TableCell>
                        <TableCell>UnknownWords</TableCell>
                        <TableCell>Difficulty</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => {
                        return <TranslationAttemptDataTableRow row={row} />
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export const TranslationAttempt: React.FC = () => {
    const m = useContext(ManagerContext)
    const translationText =
        useObservableState(m.translationAttemptService.currentTranslation$) ||
        ''
    const currentRomanization =
        useObservableState(m.translationAttemptService.currentRomanization$) ||
        ''
    const learningLanguage =
        useObservableState(
            m.translationAttemptService.currentLearningLanguage$,
        ) || ''
    const currentRow = useObservableState(
        m.translationAttemptService.currentScheduleRow$,
    )
    const answerIsShown = useObservableState(
        m.translationAttemptService.answerIsShown$,
    )
    // TODO maybe filter by due date
    const [translateAttempt, setTranslateAttempt] = useState<string>('')
    const useQuizResult = (
        obs$: Observable<unknown>,
        grade: SuperMemoGrade,
    ) => {
        useSubscription(obs$, () => {
            const previousRows = currentRow?.d.translationAttemptRecords || []
            const translationAttemptRow = SrmService.getNextRecognitionRecord(
                previousRows,
                grade,
            )
            m.translationAttemptRepository.addRecords$.next([
                {
                    learningLanguage,
                    grade,
                    translationAttempt: translateAttempt,
                    timestamp: new Date(),
                    nextDueDate: moment()
                        .add(translationAttemptRow.interval, 'minute')
                        .toDate(),
                    ...translationAttemptRow,
                },
            ])
        })
    }
    const weightedVocab =
        useObservableState(m.weightedVocabService.weightedVocab$) || new Map()
    useQuizResult(m.hotkeyEvents.quizResultEasy$, 5)
    useQuizResult(m.hotkeyEvents.quizResultMedium$, 3)
    useQuizResult(m.hotkeyEvents.quizResultHard$, 1)
    useSubscription(m.hotkeyEvents.advanceQuiz$, () =>
        m.translationAttemptService.answerIsShown$.next(true),
    )
    const totalWords = wordsFromCountRecordList(
        currentRow?.d?.wordCountRecords || [],
    )
    const sumVocab = sum(
        totalWords.map((word) =>
            weightedVocab.has(word) ? weightedVocab.get(word) : 0,
        ),
    )
    const knownText = `${sumVocab} / ${totalWords.length} words known`
    return (
        <Paper style={{ display: 'flex', flexFlow: 'column nowrap' }}>
            {learningLanguage && (
                <Fragment>
                    <Typography variant={'h3'} style={{ margin: '24px' }}>
                        {translationText}
                    </Typography>
                    {answerIsShown && (
                        <Fragment>
                            <Typography
                                variant={'h3'}
                                style={{ margin: '24px' }}
                            >
                                {learningLanguage}
                            </Typography>
                            <Typography
                                variant={'h3'}
                                style={{ margin: '24px', color: 'grey' }}
                            >
                                {currentRomanization}
                            </Typography>
                        </Fragment>
                    )}
                    <TextField
                        label={knownText}
                        inputProps={{ id: translateRequest }}
                        multiline
                        rows={3}
                        variant="filled"
                        value={translateAttempt}
                        onChange={(e) => setTranslateAttempt(e.target.value)}
                    />
{/*
                    {answerIsShown ?  // TODO use records for this
                        <DifficultyButtons previousScheduleItems={[]} /> :
                        <AdvanceButton />
                    }
*/}
                </Fragment>
            )}
        </Paper>
    )
}
