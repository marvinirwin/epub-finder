import React from "react";
import {Observable, Subject} from "rxjs";
import {useObs} from "../../UseObs";

export function MessageList({messageBuffer$}: {messageBuffer$: Observable<string[]>}) {
    const messageList = useObs(messageBuffer$, []);
    return <ul style={{
        position: 'fixed',
        top: '1em',
        right: '0px',
        width: '33vw',
        border: 'solid black 1px',
        borderRadius: '3px'
    }}>
        {messageList && messageList.map(m => <li>{m}</li>)}
    </ul>;
}