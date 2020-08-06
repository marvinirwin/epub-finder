import {Manager} from "../../lib/Manager";
import React from "react";
import {useObs} from "../../lib/UseObs";
import {Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";

export default function QuizStatsHeader({m}: {m: Manager}) {
    const newCards = useObservableState(m.scheduleManager.newCards$, []);
    const learningCards = useObservableState(m.scheduleManager.learningCards$, []);
    const toReviewCards = useObservableState(m.scheduleManager.toReviewCards$, []);
    const component = useObservableState(m.quizManager.quizzingComponent$);
    const card = useObservableState(m.quizManager.quizzingCard$);
    return <Typography variant="subtitle1">
        <div>New: <span style={{color: '#00c0c9'}}>{newCards?.length}</span></div>
        <div>Learning: <span style={{color: '#c92800'}}>{learningCards?.length}</span></div>
        <div>To Review: <span style={{color: '#15d900'}}>{toReviewCards?.length}</span></div>
    </Typography>
}