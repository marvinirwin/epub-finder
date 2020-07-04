import {Manager} from "../lib/Manager";
import DebugDisplay from "./DebugDisplay";
import {MessageList} from "./MessageLlist";
import React, { Fragment } from "react";
import {ImageSelectPopup} from "./ImageSelectPopup";

export function PopupElements({m}: { m: Manager }) {
    return <Fragment>
        <div className={'debug-display-container'}>
            <DebugDisplay text$={m.stringDisplay$} visible$={m.displayVisible$}/>
            <DebugDisplay text$={m.stringDisplay$} visible$={m.messagesVisible$}>
                <MessageList messageBuffer$={m.messageBuffer$}/>
            </DebugDisplay>
        </div>
    </Fragment>;
}