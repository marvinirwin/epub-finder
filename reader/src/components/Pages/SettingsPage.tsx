import {Manager} from "../../lib/Manager";
import {useObs, usePipe} from "../../lib/UseObs";
import React from "react";
import {debounceTime, map, scan} from "rxjs/operators";
import {useObservableState} from "observable-hooks";

export function SettingsPage({m}: { m: Manager }) {
    const scheduleRows = usePipe(m.scheduleManager.sortedScheduleRows$, o => o.pipe(map(rows => rows.map(row => row.word).join(', '))));
    const quizCard = useObservableState(m.quizManager.quizzingCard$)
    const nextQuizWord = useObservableState(m.scheduleManager.wordQuizList$)
    const quizComponent = useObservableState(m.quizManager.quizzingComponent$);
    const user = useObservableState(m.authenticationMonitor.user$);
    return <div>
        <div>Budget: {user?.profile.usedBudget} / {user?.profile.maxBudget}</div>
        <div>Schedule Rows: {scheduleRows}</div>
        <div>Current Quiz Word: {quizCard?.learningLanguage}</div>
        <div>Next Quiz Word: {nextQuizWord?.join(', ')}</div>
        <div>QuizzingComponent: {quizComponent}</div>
{/*
        <div>Card Map key count: {cardMap ? Object.values(cardMap).length : 'undefined'}</div>
        <div>Card Map Characters: {cardMap ? Object.entries(cardMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
        <div>Word Element Map: {wordElMap ? Object.entries(wordElMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
        <div>Highlighted Word: {highlightedWord}</div>
*/}
    </div>
}