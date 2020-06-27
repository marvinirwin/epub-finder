import {Manager} from "../../lib/Manager";
import {useObs} from "../../UseObs";
import {Dictionary} from "lodash";
import {RenderingBook} from "../../lib/Books/Rendering/RenderingBook";
import LeftBar from "../LeftBar";
import {Fab, Grid} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {BookContainer} from "../BookContainer";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    gridRoot: {
        height: '90vh'
    },
    bookList: {
        display: 'flex',
        flexFlow: 'column nowrap',

    }
}));


export function ReadingPage({m}: { m: Manager }) {
    const books = useObs<Dictionary<RenderingBook>>(m.bookDict$);
    const classes = useStyles();
    return <Grid container className={classes.gridRoot} /*style={{display: 'grid', gridTemplateColumns: '50% 50%'}}*/>
        <LeftBar m={m}/>
        <Grid item xs={12} className={classes.bookList}>
            <Fab onClick={() => m.simpleTextDialogOpen$.next(true)}
                aria-label="save"
                style={{position: 'absolute', right: 0, zIndex: 10000}}
            >
                <AddIcon/>
            </Fab>
            {Object.values(books || {}).map(b => <BookContainer m={m} key={b.name} rb={b}/>)}
        </Grid>
    </Grid>
}