import {Manager} from "../../lib/Manager";
import {useObs, usePipe} from "../../lib/UseObs";
import React from "react";
import {debounceTime, map, scan} from "rxjs/operators";

export function SettingsPage({m}: { m: Manager }) {
    const cardMap = useObs(m.cardManager.cardIndex$);
    const wordElMap = useObs(m.wordElementMap$);
    const highlightedWord = useObs(m.highlightedWord$);
    const scheduleRows = usePipe(m.scheduleManager.wordsSorted$, o => o.pipe(map(rows => rows.map(row => row.word).join(', '))));
    const currentQuizWord = useObs(m.quizManager.currentQuizItem$)
    return <div>
        <div>Schedule Rows: {scheduleRows}</div>
        <div>Current Quiz Word: {currentQuizWord?.knownLanguage}</div>
{/*
        <div>Card Map key count: {cardMap ? Object.values(cardMap).length : 'undefined'}</div>
        <div>Card Map Characters: {cardMap ? Object.entries(cardMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
        <div>Word Element Map: {wordElMap ? Object.entries(wordElMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
        <div>Highlighted Word: {highlightedWord}</div>
*/}
    </div>
}