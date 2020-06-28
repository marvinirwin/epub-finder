import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/Worker/UseObs";
import React from "react";

export function SettingsPage({m}: { m: Manager }) {
    const cardsLeftToLoad = useObs(m.cardsLeftToLoad$)
    const cardMap = useObs(m.cardMap$);
    return <div>
        <div>Cards left to load: {cardsLeftToLoad}</div>
        <div>Card Map key count: {cardMap ? Object.values(cardMap).length : 'undefined'}</div>
    </div>
}