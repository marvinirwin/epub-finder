import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@material-ui/core";
import React, {useContext} from "react";
import {
    quizRowsFinishedTodayTable,
    quizRowsInProgressTable,
    quizRowsNotInProgressTable,
    quizRowsToReviewTable
} from "@shared/";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {QuizCardTableHead} from "../../components/quiz/quiz-card-table-head.component";
import {QuizCardTableRow} from "../../components/quiz/quiz-card-table-row.component";

export const QuizScheduleOverView = () => {
    const m = useContext(ManagerContext);
    const quizSchedule = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$);
    const rowsUnStarted = quizSchedule?.unStartedWords || []
    const rowsToReview = quizSchedule?.wordsToReview || [];
    const rowsInProgress = quizSchedule?.wordsReviewingOrLearning || [];
    const wordsLearnedToday = quizSchedule?.wordsLearnedToday || [];
    return <Paper style={{height: '90vh', width: '90vw', display: 'flex', flexFlow: 'row wrap'}}>
        <Box m={2} p={1} style={{display: 'flex', flexFlow: 'column nowrap',  flex: 1}}>
            <TableContainer component={Paper} style={{flex: 1}}>
                <Typography style={{margin: '24px'}} variant={'h6'}>New words to learn</Typography>
                <Table size="small" id={quizRowsNotInProgressTable}>
                    <QuizCardTableHead/>
                    <TableBody>
                        {rowsUnStarted.slice(0, 20).map(row => <QuizCardTableRow row={row} key={row.d.word}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
            <TableContainer component={Paper} style={{flex: 1}}>
                <Typography style={{margin: '24px'}} variant={'h6'}>Words to review</Typography>
                <Table size="small" id={quizRowsToReviewTable}>
                    <QuizCardTableHead/>
                    <TableBody>
                        {rowsToReview.map(row => <QuizCardTableRow row={row} key={row.d.word}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
        <Box m={2} p={1} style={{display: 'flex', flexFlow: 'column nowrap', flex: 1}}>
            <TableContainer component={Paper}>
                <Typography style={{margin: '24px'}} variant={'h6'}>Words in progress</Typography>
                <Table size="small" id={quizRowsInProgressTable}>
                    <QuizCardTableHead/>
                    <TableBody>
                        {rowsInProgress.map(row => <QuizCardTableRow row={row} key={row.d.word}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
            <TableContainer component={Paper}>
                <Typography style={{margin: '24px'}} variant={'h6'}>Words learned today</Typography>
                <Table size="small" id={quizRowsFinishedTodayTable}>
                    <QuizCardTableHead/>
                    <TableBody>
                        {wordsLearnedToday.map(row => <QuizCardTableRow row={row} key={row.d.word}/>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    </Paper>
}