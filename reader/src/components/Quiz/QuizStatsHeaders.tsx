import {Manager} from "../../lib/Manager";
import React from "react";
import {useObs} from "../../lib/UseObs";
import {Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {dueDate} from "../../lib/ReactiveClasses/ScheduleRow";
import moment from "moment";

export default function QuizStatsHeader({m}: { m: Manager }) {
    const newCards = useObservableState(m.scheduleManager.newCards$, []);
    const learningCards = useObservableState(m.scheduleManager.learningCards$, []);
    const toReviewCards = useObservableState(m.scheduleManager.toReviewCards$, []);
    const scheduledCards = useObservableState(m.scheduleManager.wordQuizList$, []);

    return <div style={{zIndex: 10, backgroundColor: 'white', width: 'fit-content'}}>
        <Typography variant="subtitle1">
            <div>New: <span style={{color: '#00c0c9'}}>{newCards?.length}</span></div>
            <div>Learning: <span style={{color: '#c92800'}}>{learningCards?.length}</span></div>
            <div>To Review: <span style={{color: '#15d900'}}>{toReviewCards?.length}</span></div>
            <ul>
                {scheduledCards.map(scheduledWord => <li key={scheduledWord.word}>
                    <ul>
                        <li>{scheduledWord.word} { moment(dueDate(scheduledWord)).format('DD hh:mm') }</li>
                        {scheduledWord.wordRecognitionRecords.map(record =>
                            <li key={record.timestamp.toISOString()}>
                                {moment(record.nextDueDate).format('DD hh:mm')}
                                {moment(record.timestamp).format('DD hh:mm')}
                            </li>
                        )}
                    </ul>
                </li>)}
            </ul>
        </Typography>
    </div>
}