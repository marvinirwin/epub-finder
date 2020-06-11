import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Manager} from "../lib/Manager";
import {useObs} from "../UseObs";
import {WordCountTableRow} from "../lib/WordCountTableRow";

const useStyles = makeStyles({
    table: {
        width: '100%'
    }
});


function WordCountRow({row, m}: {row: WordCountTableRow, m: Manager}) {
    const score = useObs(row.currentRecognitionScore$);
    const count = useObs(row.currentCount$);
    return (
        <TableRow key={row.word}>
            <TableCell component="th" scope="row" >
                <div onClick={() => m.requestEditWord$.next(row.word)}>
                    {row.word}
                </div>
            </TableCell>
            <TableCell align="right">{count}</TableCell>
            <TableCell align="right">{score}</TableCell>
        </TableRow>
    );
}

export default function WordCountTable({m}: {m: Manager}) {
    const classes = useStyles();
    const rows = useObs(m.sortedWordRows$)
    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Word</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Recognition Score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows && rows.map(r => <WordCountRow key={r.word} row={r} m={m}/>)}
                </TableBody>
            </Table>
        </TableContainer>
    );
}