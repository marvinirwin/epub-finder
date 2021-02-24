import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {Table, TableContainer, TableHead, TableRow, TableCell, Paper, TableBody, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {last5, lastN} from "./last-n";
import {sum, round} from 'lodash';
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
                    <TableCell>Sort Weight</TableCell>
                    <TableCell>Due In</TableCell>
                    <TableCell>Recognition</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Pronunciation</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {scheduleRows.slice(0, 100).map(row => {
                    let className;
                    if (row.isNew()) {
                        className = 'new';
                    }
                    if (row.isLearning()) {
                        className = 'to-review';
                    }
                    if (row.isLearning()) {
                        className = 'learning'
                    }
                    return (
                        <TableRow key={row.d.word} className={`${quizCardTableRow} ${className}`}>
                            <TableCell
                                component="th"
                                scope="row"
                                className={quizCardTableRowWord}
                            >
                                <Typography variant={'h6'} >{row.d.word} </Typography>
                            </TableCell>
{/*
                            <TableCell>
                                Due Date: {round(row.d.dueDate.weightedInverseLogNormalValue || 0, 2)}
                                {JSON.stringify(row.d.normalizedDate, null, '\t')}
                            </TableCell>
*/}
                            <TableCell>
                                {`${row.dueIn()} ${+row.dueDate() < 0 ? ' ago' : ''}`}
                            </TableCell>
                            <TableCell
                                className={quizCardTableRowRecognitions}
                            >{
                                lastN(1)(row.d.wordRecognitionRecords)
                                    .map(r => `${r.recognitionScore}`)
                                    .join(',')
                            }
                            </TableCell>
                            <TableCell
                                className={quizCardTableRowCounts}
                            >{
                                sum(row.d.wordCountRecords.map(r => r.count)) || 0
                            }</TableCell>
                            <TableCell
                                className={quizCardTableRowLastAnswer}
                            >{
                                lastN(1)(row.d.pronunciationRecords)
                                    .map(r => `${r.success ? 'Correct' : ''}`)
                                    .join(',')
                            }</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </TableContainer>
}