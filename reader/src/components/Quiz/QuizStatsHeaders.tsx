import {Manager} from "../../lib/Manager";
import React from "react";
import {useObs} from "../../lib/UseObs";
import {Typography} from "@material-ui/core";

export default function QuizStatsHeader({m}: {m: Manager}) {
    const newCards = useObs(m.scheduleManager.newCards$, []);
    const learningCards = useObs(m.scheduleManager.learningCards$, []);
    const toReviewCards = useObs(m.scheduleManager.toReviewCards$, []);
    return <Typography variant="subtitle1">
        <div>New: <span style={{color: '#00c0c9'}}>{newCards?.length}</span></div>
        <div>Learning: <span style={{color: '#c92800'}}>{learningCards?.length}</span></div>
        <div>To Review: <span style={{color: '#15d900'}}>{toReviewCards?.length}</span></div>
    </Typography>
}