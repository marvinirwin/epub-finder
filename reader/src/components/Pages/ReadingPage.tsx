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
        flexGrow: 1
    },
    bookList: {
        maxHeight: '90vh',
        minHeight: '90vh',
        overflow: 'auto'
    }
}));


export function ReadingPage({m}: { m: Manager }) {
    const books = useObs<Dictionary<RenderingBook>>(m.bookDict$);
    const classes = useStyles();
    return <Grid container className={classes.gridRoot} /*style={{display: 'grid', gridTemplateColumns: '50% 50%'}}*/>
        <Grid item xs={6}>
            <LeftBar m={m}/>
        </Grid>
        <Grid item xs={6}>
            {Object.values(books || {}).map(b => <BookContainer m={m} key={b.name} rb={b}/>)}
        </Grid>
    </Grid>
}