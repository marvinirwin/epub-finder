import {Manager} from "../../lib/Manager";
import {Card, CardContent, Slide, Typography} from "@material-ui/core";
import React, {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import EditingCardComponent from "../Card/EditingCardComponent";
import AudioRecorder, {SLIM_CARD_CONTENT} from "../AudioPopup/AudioRecorder";
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
    const editingCard = useObservableState(m.editingCardManager.editingCard);
    const showEditingCard = useObservableState(m.editingCardManager.showEditingCardPopup$);
    // const recordingRequest = useObservableState(m.audioManager.audioRecorder.currentRecordRequest$);
    const highlightedPinyin = useObservableState(m.highlightedPinyin$);
    const classes = useStyles();
    return <div className={classes.popup}>
        {
            editingCard && <Slide direction="down" in={!!showEditingCard}>
                <div>
                    <EditingCardComponent card={editingCard} m={m}/>
                </div>
            </Slide>
        }
        <div>
            <AudioRecorder m={m}/>
        </div>
        <Card style={{flexGrow: 1}}>
            <CardContent style={SLIM_CARD_CONTENT}>
                <Typography variant="h6">
                    {highlightedPinyin}
                </Typography>
            </CardContent>
        </Card>
        {
/*
            recordingRequest && <Slide direction="down" in={!!recordingRequest}>
            </Slide>
*/

        }
        {}
    </div>;
}

export function ReadingPage({m}: { m: Manager }) {
    return <SlidingTopWindows m={m}/>
}