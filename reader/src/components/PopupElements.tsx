import {Manager} from "../lib/Manager";
import {ImageSelectPopup} from "./ImageSelectPopup";
import DebugDisplay from "./DebugDisplay";
import {MessageList} from "./MessageLlist";
import React, { Fragment } from "react";
import {SimpleTextModal} from "./Modals/SimpleText";

export function PopupElements({m}: { m: Manager }) {
    return <Fragment>
        <SimpleTextModal m={m}/>
        <ImageSelectPopup m={m}/>
        <div className={'debug-display-container'}>
            <DebugDisplay text$={m.stringDisplay$} visible$={m.displayVisible$}/>
            <DebugDisplay text$={m.stringDisplay$} visible$={m.messagesVisible$}>
                <MessageList messageBuffer$={m.messageBuffer$}/>
            </DebugDisplay>
        </div>
    </Fragment>;
}