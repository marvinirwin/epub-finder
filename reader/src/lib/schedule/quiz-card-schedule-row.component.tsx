import {NormalizedScheduleRowData} from "./schedule-row.interface";
import React, {useEffect, useState} from "react";
import {ScheduleRow} from "./ScheduleRow";
import {DEV} from "../../components/directory/app-directory-service";
import {DisplaySortValue} from "./schedule-row-math.component";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "../../components/quiz/quiz-card.interface";
import {TextField, Typography} from "@material-ui/core";

export const QuizCardScheduleRowDisplay = (
    {
        scheduleRow,
        quizCard
    }: {
        scheduleRow: ScheduleRow<NormalizedScheduleRowData>,
        quizCard: QuizCard
    }) => {
    const description = useObservableState(quizCard.description$.value$);
    const romanization = useObservableState(quizCard.romanization$);
    const translation = useObservableState(quizCard.translation$);
    return <div>
        <div style={{marginTop: '24px'}}>
            Due in: {scheduleRow.dueIn()}
            {DEV && <DisplaySortValue sortValue={scheduleRow.d.dueDate}/>}
        </div>
        <div style={{marginTop: '24px'}}>
            Frequency: {scheduleRow.count()}
            {DEV && <DisplaySortValue sortValue={scheduleRow.d.count}/>}
        </div>
        <div style={{marginTop: '24px'}}>
            <Typography variant='h4'>
                {romanization}
            </Typography>
            <br/>
            <Typography variant='h4'>
                {translation}
            </Typography>
        </div>
        <div style={{marginTop: '24px', marginBottom: '24px'}}>
            <TextField
                label="Description"
                multiline
                rows={3}
                variant="filled"
                value={description}
                onChange={e => quizCard.description$.set(e.target.value)}
            />
        </div>
    </div>
}
