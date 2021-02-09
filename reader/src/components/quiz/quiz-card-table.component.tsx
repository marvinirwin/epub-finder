import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {Table, TableContainer, TableHead, TableRow, TableCell, Paper, TableBody, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {last5, lastN} from "./last-n";
import {isLearning, isNew, isToReview} from "../../lib/schedule/ScheduleRow";
import {sum} from 'lodash';
import {
    quizCardTableRow,
    quizCardTableRowCounts,
    quizCardTableRowLastAnswer,
    quizCardTableRowRecognitions,
    quizCardTableRowWord
} from "@shared/";


export const QuizCardTableComponent = () => {
    const m = useContext(ManagerContext);
    const scheduleRows = useObservableState(
        m.scheduleManager.sortedScheduleRows$
    ) || [];
    return <TableContainer component={Paper}>
        <Table aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell style={{minWidth: '10em'}}>Word</TableCell>
                    <TableCell align="right">Recognition</TableCell>
                    <TableCell align="right">Frequency</TableCell>
                    <TableCell align="right">Pronunciation</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {scheduleRows.map(row => {
                    let className;
                    if (isNew(row)) {
                        className = 'new';
                    }
                    if (isToReview(row)) {
                        className = 'to-review';
                    }
                    if (isLearning(row)) {
                        className = 'learning'
                    }
                    return (
                        <TableRow key={row.word} className={`${quizCardTableRow} ${className}`}>
                            <TableCell
                                component="th"
                                scope="row"
                                className={quizCardTableRowWord}
                            >
                                <Typography variant={'h6'} >{row.word} </Typography>
                            </TableCell>
                            <TableCell
                                className={quizCardTableRowRecognitions}
                            >{
                                lastN(1)(row.wordRecognitionRecords)
                                    .map(r => `${r.recognitionScore}`)
                                    .join(',')
                            }
                            </TableCell>
                            <TableCell
                                className={quizCardTableRowCounts}
                            >{
                                sum(row.wordCountRecords.map(r => r.count))
                            }</TableCell>
                            <TableCell
                                className={quizCardTableRowLastAnswer}
                            >{
                                lastN(1)(row.pronunciationRecords)
                                    .map(r => `${r.success ? 'Correct' : 'Incorrect'}`)
                                    .join(',')
                            }</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </TableContainer>
}