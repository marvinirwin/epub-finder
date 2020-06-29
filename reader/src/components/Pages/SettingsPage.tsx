import {Manager} from "../../lib/Manager";
import {useObs, usePipe} from "../../lib/Worker/UseObs";
import React from "react";
import {debounceTime, map, scan} from "rxjs/operators";

export function SettingsPage({m}: { m: Manager }) {
    const cardMap = useObs(m.cardManager.cardIndex$);
    const textToBeTranslated = usePipe(m.textToBeTranslated$, c => c.pipe(
        debounceTime(500),
        scan((acc: string[], v) => {acc.push(v); return acc;}, []),
        map(v => v.join(", "))
    ));
    const translatedText = useObs(m.translatedText$);
    return <div>
        <div>Card Map key count: {cardMap ? Object.values(cardMap).length : 'undefined'}</div>
        <div>Text to translate: {textToBeTranslated}</div>
        <div>Translated text: {translatedText}</div>
        <div>Card Map Characters: {cardMap ? Object.entries(cardMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
    </div>
}