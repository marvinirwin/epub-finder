import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import {WordCountRow} from "./ScheduleTableRow";

const useStyles = makeStyles({
    table: {
        width: '100%'
    }
});

function perc2color(perc: number) {
    if (perc > 100) perc = 100;
    var r, g, b = 0;
    if(perc < 50) {
        r = 255;
        g = Math.round(5.1 * perc);
    }
    else {
        g = 255;
        r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

export default function ScheduleTable({m}: { m: Manager }) {
    const classes = useStyles();
    const rows = useObs(m.scheduleManager.sortedScheduleRows)
    return (
        <TableContainer component={Paper} style={{flexGrow: 1, overflow: 'auto'}}>
            <Table className={classes.table} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Word</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Due Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows && rows.map(r => <WordCountRow key={r.word} row={r} m={m}/>)}
                </TableBody>
            </Table>
        </TableContainer>
    );
}