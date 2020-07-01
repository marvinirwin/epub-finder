import {Manager} from "../../lib/Manager";
import {useObs, usePipe} from "../../lib/UseObs";
import React from "react";
import {debounceTime, map, scan} from "rxjs/operators";

export function SettingsPage({m}: { m: Manager }) {
    const cardMap = useObs(m.cardManager.cardIndex$);
    return <div>
        <div>Card Map key count: {cardMap ? Object.values(cardMap).length : 'undefined'}</div>
        <div>Card Map Characters: {cardMap ? Object.entries(cardMap).map(([k, v]) => `${k}: ${v.length}`).join(',') : ''}</div>
    </div>
}