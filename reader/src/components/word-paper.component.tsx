import {WordCard} from "./quiz/word-card.interface";
import React, {useContext} from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@material-ui/core";
import {CardImage} from "./quiz/quiz-card-image.component";
import {
    quizCardDescription,
    quizCardLearningLanguage,
    quizCardRomanization,
    quizCardTranslation,
    wordCardRomanization, wordCardTranslation
} from "@shared/";
import {useObservableState} from "observable-hooks";
import {ManagerContext} from "../App";
import {NormalizedScheduleRowData, ScheduleRow} from "../lib/schedule/schedule-row";
import {formatDueDate} from "../lib/schedule/format-due-date";


export const CardLearningLanguageText = ({word}: { word: string }) => {
    const m = useContext(ManagerContext);
    return <Typography
        onClick={() => m.wordCardModalService.word$.next(word)}
        variant={'h1'}
        className={quizCardLearningLanguage}
    >{word || ''}</Typography>
}

const RecognitionRowTable: React.FC<{ scheduleRow: ScheduleRow<NormalizedScheduleRowData> }> =
    ({scheduleRow}) => {
        return <TableContainer component={Paper}>
            <Table size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell>Grade</TableCell>
                        <TableCell align="right">Next Due Date</TableCell>
                        <TableCell align="right">Timestamp</TableCell>
                        <TableCell align="right">Interval</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {scheduleRow.d.wordRecognitionRecords.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell component="th" scope="row">
                                {row.grade}
                            </TableCell>
                            <TableCell align="right">{formatDueDate(row.nextDueDate || new Date())}</TableCell>
                            <TableCell align="right">{formatDueDate(row.timestamp || new Date())}</TableCell>
                            <TableCell align="right">{row.interval}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    };

const CountRecordTable: React.FC<{ scheduleRow: ScheduleRow<NormalizedScheduleRowData> }> =
    ({scheduleRow}) => {
        return <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Document</TableCell>
                        <TableCell align="right">Count</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {scheduleRow.d.wordCountRecords.map((row) => (
                        <TableRow key={`${row.document}${row.word}${row.count}`}>
                            <TableCell component="th" scope="row">
                                {row.document}
                            </TableCell>
                            <TableCell align="right">{row.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    };

export const WordPaperComponent: React.FC<{ wordCard: WordCard }> = ({wordCard}) => {
    const m = useContext(ManagerContext);
    const word = useObservableState(wordCard.word$);
    const scheduleRows = useObservableState(m.scheduleRowsService.indexedScheduleRows$) || {};
    const scheduleRow = scheduleRows[word || ''];
    const romanization = useObservableState(wordCard.romanization$);
    const translation = useObservableState(wordCard.translation$);
    const description = useObservableState(wordCard.description$.value$);
    return <Paper style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center'
    }}>
        <CardImage quizCard={wordCard}/>
        <CardLearningLanguageText word={word || ''}/>
        <Typography variant='h4' className={wordCardRomanization}>
            {romanization}
        </Typography>
        <br/>
        <Typography variant='h4' className={wordCardTranslation}>
            {translation}
        </Typography>
        <br/>
        <TextField
            label="Description"
            inputProps={{className: quizCardDescription}}
            multiline
            rows={3}
            variant="filled"
            value={description || ''}
            onChange={e => wordCard.description$.set(e.target.value)}
        />
        <br/>
        {scheduleRow && <RecognitionRowTable scheduleRow={scheduleRow}/>}
        <br/>
        {scheduleRow && <CountRecordTable scheduleRow={scheduleRow}/>}
    </Paper>
}