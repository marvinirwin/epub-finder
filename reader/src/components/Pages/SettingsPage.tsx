import {Manager} from "../../lib/Manager";
import {useObs, usePipe} from "../../lib/UseObs";
import React from "react";
import {debounceTime, map, scan} from "rxjs/operators";

export function SettingsPage({m}: { m: Manager }) {
    const scheduleRows = usePipe(m.scheduleManager.sortedScheduleRows, o => o.pipe(map(rows => rows.map(row => row.word).join(', '))));
    const quizCard = useObs(m.quizManager.quizzingCard$)
    const nextQuizWord = useObs(m.scheduleManager.wordQuizList$)
    const quizComponent = useObs(m.quizManager.quizzingComponent$)
    return <div>
        <div>Schedule Rows: {scheduleRows}</div>
        <div>Current Quiz Word: {quizCard?.learningLanguage}</div>
        <div>Next Quiz Word: {nextQuizWord?.join(', ')}</div>
        <div>QuizzingComponent: {quizComponent?.name}</div>
{/*
        <div>Card Map key count: {cardMap ? Object.values(cardMap).length : 'undefined'}</div>
        <div>Card Map Characters: {cardMap ? Object.entries(cardMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
        <div>Word Element Map: {wordElMap ? Object.entries(wordElMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
        <div>Highlighted Word: {highlightedWord}</div>
*/}
    </div>
}