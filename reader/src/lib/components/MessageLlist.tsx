import React from "react";
import {Observable, Subject} from "rxjs";
import {useObs} from "../../UseObs";

export function MessageList({messageBuffer$}: {messageBuffer$: Observable<string[]>}) {
    const messageList = useObs(messageBuffer$, []);
    return <ul className={'message-list'}>
        {messageList && messageList.map(m => <li key={m}>{m}</li>)}
    </ul>;
}