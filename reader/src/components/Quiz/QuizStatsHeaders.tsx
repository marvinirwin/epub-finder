import {Manager} from "../../lib/Manager";
import React from "react";
import {usePipe} from "../../lib/UseObs";
import {filter, map} from "rxjs/operators";

export default function QuizStatsHeader({m}: {m: Manager}) {
    const newCards = usePipe(m.scheduleManager.wordsSorted$, obs$ => obs$);
    const learningCards = usePipe(m.scheduleManager.wordsSorted$, obs$ => obs$);

    const toReviewCards = usePipe(m.scheduleManager.wordsSorted$, obs$ => obs$);
    return <div>
        <span>New: {newCards.length}</span>
        <span>Learning: {learningCards.length}</span>
        <span>To Review: {toReviewCards.length}</span>
    </div>
}