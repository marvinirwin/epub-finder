import {AppSingleton, EditingCardInInterface} from "../AppSingleton";
import {useObs} from "../UseObs";
import {BookInstance} from "../managers/BookManager";
import {ICard} from "../AppDB";
import React, {useEffect, useState} from "react";
import {combineLatest, Observable} from "rxjs";
import {Cards} from "./CardTree";
import {SpineItemMenu} from "./SpineItemMenu";
import {MessageList} from "./MessageLlist";
import {AppBar, Drawer, IconButton, List, Toolbar, Typography} from "@material-ui/core";
import DebugMessage from "../Debug-Message";
import DebugDisplay from "./DebugDisplay";

function TopBar() {
    return <AppBar position="static">
        <Toolbar>
        </Toolbar>
    </AppBar>;
}

function getDiv(messageBuffer$: Observable<DebugMessage[]>) {
    return <div className={'message-list-container'}>
        <MessageList messageBuffer$={messageBuffer$}/>
    </div>;
}

export function Main({s}: { s: AppSingleton }) {
    const {m, messageBuffer$} = s;
    const book = useObs<BookInstance | undefined>(m.currentBook$)
    const currentPackage = useObs(m.currentPackage$);
    const packages = useObs(m.packages$, m.packages$.getValue());
    const editingCard = useObs<EditingCardInInterface | undefined>(m.cardInEditor$);

/*
    const textBuffer = useObs(m.textBuffer$, '');
*/



    return (
        <div className={'root'}>
            <div className={'debug-display-container'}>
                <DebugDisplay text$={m.stringDisplay$} visible$={m.displayVisible$}/>
                <DebugDisplay text$={m.renderMessages$} visible$={m.messagesVisible$}/>
            </div>
{/*
            <MessageList messageBuffer$={messageBuffer$}/>
*/}
            <div className={'text-display'}>
                {" "}
                <div id="book" style={{width: '100%', height: '100%'}}/>
            </div>
        </div>
    );
}