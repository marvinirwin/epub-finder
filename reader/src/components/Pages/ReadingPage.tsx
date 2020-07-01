import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import {Fab, Grid, Slide} from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";
import React, {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import EditingCardComponent from "../EditingCard/EditingCardComponent";
import AudioPopup from "../AudioPopup/AudioPopup";

const useStyles = makeStyles((theme) => ({
    popup: {
        position: 'absolute',
        right: 0,
        zIndex: 2,
        width: '100vw',
        display: 'flex',
        maxHeight: '1px',
        overflow: 'visible',
        '& > *': {
            height: 'fit-content',
            flexGrow: 0
        }
    },

}));

export function ReadingPage({m}: { m: Manager }) {
    const classes = useStyles();
    const editingCard = useObs(m.currentEditingCard$);

    return <Grid container>
        <div className={classes.popup}>
            {editingCard && <Fragment>
                <div>
                    <Fab onClick={e => m.queEditingCard$.next(undefined)}><CancelIcon/></Fab>
                </div>
                <EditingCardComponent card={editingCard}/>
                <AudioPopup m={m}/>
            </Fragment>}
        </div>
    </Grid>
}