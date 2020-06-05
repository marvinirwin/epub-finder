import {AppSingleton, EditingCardInInterface} from "../AppSingleton";
import {useObs} from "../UseObs";
import {BookInstance} from "../managers/BookManager";
import {ICard} from "../AppDB";
import React, {useEffect, useRef, useState} from "react";
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
    const {m} = s;
    const book = useObs<BookInstance | undefined>(m.currentBook$)
    const currentPackage = useObs(m.currentPackage$);
    const packages = useObs(m.packages$, m.packages$.getValue());
    const editingCard = useObs<EditingCardInInterface | undefined>(m.cardInEditor$);
    const ref = useRef<HTMLDivElement>(null);
/*
    const textBuffer = useObs(m.textBuffer$, '');
*/

    useEffect(() => {
        ref && ref.current && m.renderRef$.next(ref.current);
    }, [ref])


    return (
        <div className={'root'}>
            <div className={'debug-display-container'}>
                <DebugDisplay text$={m.stringDisplay$} visible$={m.displayVisible$}/>
                <DebugDisplay text$={m.stringDisplay$} visible$={m.messagesVisible$}>
                    <MessageList messageBuffer$={m.messageBuffer$}/>
                </DebugDisplay>
            </div>
{/*
            <MessageList messageBuffer$={messageBuffer$}/>
*/}
            <div className={'text-display'}>
                {" "}
                <div id="book" style={{width: '100%', height: '100%'}} ref={ref}>x</div>
            </div>
        </div>
    );
}