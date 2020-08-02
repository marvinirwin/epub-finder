import {Manager} from "../../lib/Manager";
import React from "react";
import {useObs} from "../../lib/UseObs";

export default function QuizStatsHeader({m}: {m: Manager}) {
    const newCards = useObs(m.scheduleManager.newCards$, []);
    const learningCards = useObs(m.scheduleManager.learningCards$, []);
    const toReviewCards = useObs(m.scheduleManager.toReviewCards$, []);
    return <div>
        <div>New: {newCards?.length}</div>
        <div>Learning: {learningCards?.length}</div>
        <div>To Review: {toReviewCards?.length}</div>
    </div>
}