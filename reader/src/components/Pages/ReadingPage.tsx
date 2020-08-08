import {Manager} from "../../lib/Manager";
import {Grid, Slide} from "@material-ui/core";
import React, {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import EditingCardComponent from "../Card/EditingCardComponent";
import AudioPopup from "../AudioPopup/AudioPopup";
import {useObservableState} from "observable-hooks";
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";

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
            flexGrow: 0,
            '& > *': {
                height: 'fit-content',
                flexGrow: 0,
            }
        }
    },

}));

export function SlidingTopWindows({m}: { m: Manager }) {
    const editingCard = useObservableState(m.currentEditingCard$);
    const recordingRequest = useObservableState(m.audioManager.audioRecorder.currentRecordRequest$);
    const classes = useStyles();
    return <div className={classes.popup}>
        {
            editingCard && <Slide direction="down" in={!!editingCard}>
                <div>
                    <EditingCardComponent card={editingCard}/>
                </div>
            </Slide>
        }
        {
            recordingRequest && <Slide direction="down" in={!!recordingRequest}>
                <div>
                    <AudioPopup m={m}/>
                </div>
            </Slide>
        }
        {/*
            {editingCard && <EditingCardComponent card={editingCard}/>}
            <div style={{width: '100%', display: 'flex'}}>
            </div>
        */}
    </div>;
}

export function ReadingPage({m}: { m: Manager }) {
    return <SlidingTopWindows m={m}/>
}