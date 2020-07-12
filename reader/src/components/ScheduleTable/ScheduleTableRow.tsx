import {WordCountTableRow} from "../../lib/ReactiveClasses/WordCountTableRow";
import {Manager} from "../../lib/Manager";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import moment from "moment";
import React from "react";
import {Button} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    quizButton: {
        margin: 0,
        height: '100%',
        width: '100%'
    }
}));

export function WordCountRow({row, m}: { row: WordCountTableRow, m: Manager }) {
    const classes = useStyles();
    return (
        <TableRow key={row.word}>
            <TableCell component="th" scope="row">
                <Button className={classes.quizButton} onClick={() => {
                    m.setQuizWord$.next(row.word)
                }}>
                    {row.word}
                </Button>
            </TableCell>
            <TableCell align="right">{row.getCurrentCount()}</TableCell>
            <TableCell align="right">{moment(row.getCurrentDueDate()).format('YYYY MM DD')}</TableCell>
        </TableRow>
    );
}