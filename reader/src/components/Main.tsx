import {AppSingleton, EditingCard, EditingCardClass} from "../AppSingleton";
import {useObs} from "../UseObs";
import { RenderingBook} from "../managers/RenderingBook";
import React, {useEffect, useRef, useState, Fragment} from "react";
import {MessageList} from "./MessageLlist";
import {Grid, Paper} from "@material-ui/core";
import DebugDisplay from "./DebugDisplay";
import TopBar from "./TopBar";
import {Dictionary} from "lodash";
import LeftBar from "./LeftBar";
import {makeStyles} from "@material-ui/core/styles";


function BookContainer({rb}: { rb: RenderingBook }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        ref && ref.current && rb.renderRef$.next(ref.current);
    }, [ref])
    return <Paper variant="outlined" elevation={3}>
        <div id={rb.getId()} style={{width: '100%', height: '50%'}} ref={ref}/>
    </Paper>;
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width: '100%',
        flexFlow: 'column nowrap',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));

export function Main({s}: { s: AppSingleton }) {
    const {m} = s;
    const book = useObs<RenderingBook | undefined>(m.currentBook$)
    const currentPackage = useObs(m.currentPackage$);
    const packages = useObs(m.packages$, m.packages$.getValue());
    const editingCard = useObs<EditingCard | undefined>(m.cardInEditor$);
    const classes = useStyles();
    const books = useObs<Dictionary<RenderingBook>>(m.bookDict$)

    return <Fragment>
        <div className={'debug-display-container'}>
            <DebugDisplay text$={m.stringDisplay$} visible$={m.displayVisible$}/>
            <DebugDisplay text$={m.stringDisplay$} visible$={m.messagesVisible$}>
                <MessageList messageBuffer$={m.messageBuffer$}/>
            </DebugDisplay>
        </div>
        <Grid container spacing={0}>
            <Grid container item xs={12}>
                <TopBar m={m}/>
            </Grid>
            <Grid container item xs={4}>
                <LeftBar m={m}/>
            </Grid>
            <Grid container item xs={8}>
                <div className={classes.root}>
                    {Object.values(books || {}).map(b => <BookContainer key={b.name} rb={b}/>)}
                </div>
            </Grid>
        </Grid>
    </Fragment>;
}