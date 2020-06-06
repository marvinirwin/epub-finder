import {AppSingleton, EditingCardInInterface} from "../AppSingleton";
import {useObs} from "../UseObs";
import {BookInstance, RenderingBook} from "../managers/RenderingBook";
import {ICard} from "../AppDB";
import React, {useEffect, useRef, useState} from "react";
import {combineLatest, Observable} from "rxjs";
import {Cards} from "./CardTree";
import {SpineItemMenu} from "./SpineItemMenu";
import {MessageList} from "./MessageLlist";
import {AppBar, Drawer, IconButton, List, Toolbar, Typography} from "@material-ui/core";
import DebugMessage from "../Debug-Message";
import DebugDisplay from "./DebugDisplay";
import TopBar from "./TopBar";
import {map} from "rxjs/operators";
import { Dictionary } from "lodash";


function BookContainer({rb}: {rb: RenderingBook}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        ref && ref.current && rb.renderRef$.next(ref.current);
    }, [ref])
    return <div id={rb.getId()} style={{width: '100%'}} ref={ref}/>
}

export function Main({s}: { s: AppSingleton }) {
    const {m} = s;
    const book = useObs<RenderingBook | undefined>(m.currentBook$)
    const currentPackage = useObs(m.currentPackage$);
    const packages = useObs(m.packages$, m.packages$.getValue());
    const editingCard = useObs<EditingCardInInterface | undefined>(m.cardInEditor$);
/*
    const textBuffer = useObs(m.textBuffer$, '');
*/
    const books = useObs<Dictionary<RenderingBook>>(m.bookDict$)

    return (
        <div className={'root'}>
            <div className={'debug-display-container'}>
                <DebugDisplay text$={m.stringDisplay$} visible$={m.displayVisible$}/>
                <DebugDisplay text$={m.stringDisplay$} visible$={m.messagesVisible$}>
                    <MessageList messageBuffer$={m.messageBuffer$}/>
                </DebugDisplay>
            </div>
            <TopBar m={m}/>
{/*
            <MessageList messageBuffer$={messageBuffer$}/>
*/}
            <div className={'text-display'}>
                {" "}
                {Object.values(books || {}).map(b => <BookContainer key={b.name} rb={b}/>)}
            </div>
        </div>
    );
}