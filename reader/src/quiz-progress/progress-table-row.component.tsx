import React from "react";
import {WordRecognitionRow} from "../lib/schedule/word-recognition-row";
import {TableCell, TableRow, Typography} from "@material-ui/core";
import moment from "moment";

export const ProgressTableRow: React.FC<{ recognitionRecord: WordRecognitionRow }> = ({recognitionRecord}) => {
    return <TableRow>
        <TableCell component="th" scope="row">
            <Typography variant={'h6'}>{recognitionRecord.word} </Typography>
        </TableCell>
        <TableCell component="th" scope="row">
            <Typography>{recognitionRecord.grade} </Typography>
        </TableCell>
        <TableCell component="th" scope="row">
            <Typography>{moment(recognitionRecord.nextDueDate).format('DD hh:mm:ss')} </Typography>
        </TableCell>
        <TableCell component="th" scope="row">
            <Typography>{moment(recognitionRecord.timestamp).format('DD hh:mm:ss')} </Typography>
        </TableCell>
        <TableCell component="th" scope="row">
            <Typography>{recognitionRecord.efactor} </Typography>
        </TableCell>
    </TableRow>
};