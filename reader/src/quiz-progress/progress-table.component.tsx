import React, {useContext} from "react";
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Paper,
    TableBody,
    Typography,
    Toolbar,
} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../App";
import {WordRecognitionRow} from "../lib/schedule/word-recognition-row";

import moment from "moment";
import { orderBy } from "lodash";

const ProgressTableToolbar: React.FC<{}> = () => {
    return <Toolbar style={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h6" component="div">
            Progress Made
        </Typography>
    </Toolbar>
};

const ProgressTableHead: React.FC<{}> = () => {
    return <TableHead>
        <TableRow>
            <TableCell>Word</TableCell>
            <TableCell>Score</TableCell>
        </TableRow>
    </TableHead>
};

const ProgressTableRow: React.FC<{ recognitionRecord: WordRecognitionRow }> = ({recognitionRecord}) => {
    return <TableRow>
        <TableCell component="th" scope="row" >
            <Typography variant={'h6'}>{recognitionRecord.word} </Typography>
        </TableCell>
        <TableCell component="th" scope="row" >
            <Typography>{recognitionRecord.grade} </Typography>
        </TableCell>
    </TableRow>
};

export const ProgressTableComponent = () => {
    const m = useContext(ManagerContext);
    const recognitionRecords = useObservableState(m.wordRecognitionProgressService.recordList$) || [];
    return <div>
        <ProgressTableToolbar/>
        <TableContainer component={Paper}>
            <Table size='small'>
                <ProgressTableHead/>
                <TableBody>
                    {orderBy(
                        recognitionRecords.filter(r => r.grade >= 3),
                        r => r.timestamp, 'desc')
                        .map(recognitionRecord => <ProgressTableRow recognitionRecord={recognitionRecord} key={recognitionRecord.word}/>)}
                </TableBody>
            </Table>
        </TableContainer>
    </div>
}