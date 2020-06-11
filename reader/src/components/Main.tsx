import {AppSingleton} from "../AppSingleton";
import {useObs} from "../UseObs";
import {RenderingBook} from "../lib/RenderingBook";
import React, {Fragment} from "react";
import {MessageList} from "./MessageLlist";
import {Grid} from "@material-ui/core";
import DebugDisplay from "./DebugDisplay";
import TopBar from "./TopBar";
import {Dictionary} from "lodash";
import LeftBar from "./LeftBar";
import {makeStyles} from "@material-ui/core/styles";
import {BookContainer} from "./BookContainer";
import {EditingCard} from "../lib/EditingCard";

window.addEventListener("dragover",function(e){
    e.preventDefault();
},false);
window.addEventListener("drop",function(e){
    e.preventDefault();
},false);

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        width: '100%',
        flexFlow: 'column nowrap',
        '& > *': {
            borderRadius: 0
        },
    },
}));

export function Main({s}: { s: AppSingleton }) {
    const {m} = s;
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
            <Grid container item xs={6}>
                <LeftBar m={m}/>
            </Grid>
            <Grid container item xs={6}>
                <div className={classes.root}>
                    {Object.values(books || {}).map(b => <BookContainer m={m} key={b.name} rb={b}/>)}
                </div>
            </Grid>
        </Grid>
    </Fragment>;
}