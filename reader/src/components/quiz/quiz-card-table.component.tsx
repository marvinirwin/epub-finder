import {ManagerContext} from "../../App";
import React, {useContext} from "react";
import {Table, TableContainer, TableHead, TableRow, TableCell, Paper, TableBody} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {last5, lastN} from "./last-n";
import {isLearning, isNew, isToReview} from "../../lib/schedule/ScheduleRow";



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
                    <TableCell align="right">Word Counts</TableCell>
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
                        <TableRow key={row.word} className={className}>
                            <TableCell component="th" scope="row"> {row.word} </TableCell>
                            <TableCell align="right">{
                                lastN(1)(row.wordRecognitionRecords)
                                    .map(r => `${r.recognitionScore}`)
                                    .join(',')
                            }
                            </TableCell>
                            <TableCell align="right">{
                                (row.wordCountRecords)
                                    .map(r => `${r.document} ${r.count}`)
                                    .join(',')
                            }</TableCell>
                            <TableCell align="right">{
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