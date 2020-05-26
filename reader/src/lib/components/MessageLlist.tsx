import React from "react";
import {Observable, Subject} from "rxjs";
import {useObs} from "../../UseObs";

export function MessageList({messageBuffer$}: {messageBuffer$: Observable<string[]>}) {
    const messageList = useObs(messageBuffer$, []);
    return <ul>
        {messageList && messageList.map(m => <li>{m}</li>)}
    </ul>;
}