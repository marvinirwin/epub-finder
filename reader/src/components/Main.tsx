import {AppSingleton, EditingCardInInterface} from "../AppSingleton";
import {useObs} from "../UseObs";
import {BookInstance, RenderingBook} from "../managers/BookManager";
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


function BookContainer({rb}: {rb: RenderingBook}) {
    const ref = useRef<HTMLDivElement>(null);
    const instance = useObs(rb.bookInstance$)
    useEffect(() => {
        ref && ref.current && rb.renderRef$.next(ref.current);
    }, [ref])
    return <div id={`render_parent_${instance?.name}`} style={{width: '100%'}} ref={ref}/>
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
/*
TODO why does this cause inifinite re-render
    const books = useObs<RenderingBook[]>(m.bookDict$.pipe(map(d => Object.values(d))))
*/

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
{/*
                {books?.map(b => <BookContainer key={b.name} rb={b}/>)}
*/}
            </div>
        </div>
    );
}