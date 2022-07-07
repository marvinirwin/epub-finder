import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core'
import React, { useContext } from 'react'
import {
    quizRowsFinishedTodayTable,
    quizRowsInProgressTable,
    quizRowsNotInProgressTable,
    quizRowsToReviewTable,
} from 'languagetrainer-server/src/shared'
import { ManagerContext } from '../../App'
import { useObservableState } from 'observable-hooks'
import { QuizCardTableHead } from '../../components/quiz/quiz-card-table-head.component'
import { QuizCardTableRow } from '../../components/quiz/quiz-card-table-row.component'

export const QuizScheduleOverView = () => {
    const m = useContext(ManagerContext)
    const quizSchedule = useObservableState(
        m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$,
    )
    const rowsUnStarted = quizSchedule?.unStartedWords || []
    const rowsToReview = quizSchedule?.wordsToReview || []
    const rowsInProgress = quizSchedule?.wordsLearning || []
    const wordsLearnedToday = quizSchedule?.wordsLearnedToday || []
    return (
        <Paper
            style={{
                height: '90vh',
                width: '90vw',
                display: 'flex',
                flexFlow: 'row wrap',
            }}
        >
            <Box
                m={2}
                p={1}
                style={{ display: 'flex', flexFlow: 'column nowrap', flex: 1 }}
            >
                <TableContainer component={Paper}>
                    <Typography style={{ margin: '24px' }} variant={'h6'}>
                        Cards in progress
                    </Typography>
                    <Table size="small" id={quizRowsInProgressTable}>
                        <QuizCardTableHead />
                        <TableBody>
                            {rowsInProgress.map((row) => (
                                <QuizCardTableRow row={row} key={row.d.word} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TableContainer component={Paper}>
                    <Typography style={{ margin: '24px' }} variant={'h6'}>
                        Cards completed today
                    </Typography>
                    <Table size="small" id={quizRowsFinishedTodayTable}>
                        <QuizCardTableHead />
                        <TableBody>
                            {wordsLearnedToday.map((row) => (
                                <QuizCardTableRow row={row} key={row.d.word} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Box
                m={2}
                p={1}
                style={{ display: 'flex', flexFlow: 'column nowrap', flex: 1 }}
            >
                <TableContainer component={Paper} style={{ flex: 1 }}>
                    <Typography style={{ margin: '24px' }} variant={'h6'}>
                        Quiz card ordering
                    </Typography>
                    <Table size="small">
                        <QuizCardTableHead />
                        <TableBody>
                            {
                                /**
                                 * This is the one quiz schedule uses
                                 */
                            }
                            {quizSchedule?.limitedScheduleRows.slice(0, 20).map((row) => (
                                <QuizCardTableRow row={row} key={row.d.word} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TableContainer component={Paper} style={{ flex: 1 }}>
                    <Typography style={{ margin: '24px' }} variant={'h6'}>
                        Cards to be learned for the first time
                    </Typography>
                    <Table size="small" id={quizRowsNotInProgressTable}>
                        <QuizCardTableHead />
                        <TableBody>
                            {rowsUnStarted.slice(0, 20).map((row) => (
                                <QuizCardTableRow row={row} key={row.d.word} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TableContainer component={Paper} style={{ flex: 1 }}>
                    <Typography style={{ margin: '24px' }} variant={'h6'}>
                        Cards to review
                    </Typography>
                    <Table size="small" id={quizRowsToReviewTable}>
                        <QuizCardTableHead />
                        <TableBody>
                            {rowsToReview.map((row) => (
                                <QuizCardTableRow row={row} key={row.d.word} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Paper>
    )
}
