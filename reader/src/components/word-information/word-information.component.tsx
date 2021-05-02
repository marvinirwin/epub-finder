import { WordCard } from '../quiz/word-card.interface'
import React, { useContext, Fragment } from 'react'
import {
    Button,
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
import { CardImage } from '../quiz/quiz-card-image.component'
import {
    quizCardDescription,
    quizCardLearningLanguage,
    wordCardRomanization,
    wordCardTranslation,
} from '@shared/'
import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'
import {
    SortQuizData,
    ScheduleRow,
} from '../../lib/schedule/schedule-row'
import { formatDueDate } from '../../lib/schedule/format-due-date'
import { round, flatten } from 'lodash'
import { useLoadingObservableString } from '../../lib/util/create-loading-observable'
import { WordRecognitionRow } from '../../lib/schedule/word-recognition-row'
import { WordCountRecord } from '../../../../server/src/shared/tabulation/tabulate'
import { DocumentWordCount } from '../../../../server/src/shared/DocumentWordCount'
import { Variant } from '@material-ui/core/styles/createTypography'

export const CardLearningLanguageText = ({ word, variant }: { word: string, variant?: Variant }) => {
    const m = useContext(ManagerContext)
    return (
        <Button
            onClick={() => m.wordCardModalService.word$.next(word)}
            className={quizCardLearningLanguage}
        >
            <Typography variant={variant || 'h1'}>{word || ''}</Typography>
        </Button>
    )
}

const RecognitionRowTable: React.FC<{
    wordRecognitionRows: WordRecognitionRow[],
}> = ({ wordRecognitionRows }) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>Grade</TableCell>
                        <TableCell align="right">Next Due Date</TableCell>
                        <TableCell align="right">Timestamp</TableCell>
                        <TableCell align="right">Interval</TableCell>
                        <TableCell align="right">Flash Card Type</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {wordRecognitionRows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                                {row.grade}
                            </TableCell>
                            <TableCell align="right">
                                {formatDueDate(row.nextDueDate || new Date())}
                            </TableCell>
                            <TableCell align="right">
                                {formatDueDate(row.created_at || new Date())}
                            </TableCell>
                            <TableCell align="right">{row.interval}</TableCell>
                            <TableCell align="right">{row.flash_card_type}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const CountRecordTable: React.FC<{
    countRecords: DocumentWordCount[],
}> = ({ countRecords }) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Document</TableCell>
                        <TableCell align="right">Count</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {countRecords.map((row) => (
                        <TableRow
                            key={`${row.document}${row.word}${row.count}`}
                        >
                            <TableCell component="th" scope="row">
                                {row.document}
                            </TableCell>
                            <TableCell align="right">{row.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}



export const WordInformationComponent: React.FC<{ wordCard: WordCard }> = ({
    wordCard,
}) => {
    const m = useContext(ManagerContext)
    const word = useObservableState(wordCard.word$)
    const scheduleRows =
        useObservableState(
            m.quizCardScheduleRowsService.scheduleRows$,
        )?.filter(r => r.d.word === word) || [];
    const romanization = useLoadingObservableString(wordCard.romanization$, '')
    const translation = useLoadingObservableString(wordCard.translation$, '')
    const description = useObservableState(wordCard.description$.value$)
    return (
        <Paper
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'center',
            }}
        >
            <CardImage wordInfo={wordCard} />
            <CardLearningLanguageText word={word || ''} />
            <Typography variant="h4" className={wordCardRomanization}>
                {romanization}
            </Typography>
            <br />
            <Typography variant="h4" className={wordCardTranslation}>
                {translation}
            </Typography>
            <br />
            <TextField
                label="Description"
                inputProps={{ className: quizCardDescription }}
                multiline
                rows={3}
                variant="filled"
                value={description || ''}
                onChange={(e) => wordCard.description$.set(e.target.value)}
            />
{/*
            {sortInfo && (
                <Fragment>
                    <Typography variant={'subtitle1'}>
                        Count Weight:{' '}
                        {round(sortInfo.count.weightedInverseLogNormalValue, 2)}
                    </Typography>
                    <Typography variant={'subtitle1'}>
                        Date Weight:{' '}
                        {round(
                            sortInfo.dueDate.weightedInverseLogNormalValue,
                            2,
                        )}
                    </Typography>
                    <Typography variant={'subtitle1'}>
                        Length:{' '}
                        {round(
                            sortInfo.length.weightedInverseLogNormalValue,
                            2,
                        )}
                    </Typography>
                    <Typography variant={'subtitle1'}>
                        Sentence Priority:{' '}
                        {round(
                            sortInfo.sentencePriority
                                .weightedInverseLogNormalValue,
                            2,
                        )}
                    </Typography>
                </Fragment>
            )}
*/}
            <br />
            <RecognitionRowTable wordRecognitionRows={flatten(scheduleRows.map(r => r.d.wordRecognitionRecords))} />
            <br />
            <CountRecordTable countRecords={flatten(scheduleRows.map(r => r.d.wordCountRecords))} />
        </Paper>
    )
}
