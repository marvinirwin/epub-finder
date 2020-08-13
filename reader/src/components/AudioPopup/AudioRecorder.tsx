import {makeStyles} from "@material-ui/core/styles";
import React, {useEffect, useRef, useState} from "react";
import {Button, Card, CardActions, CardContent, Grid, IconButton, Typography} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import CountdownCircle from "./CountdownCircle";
import RefreshIcon from '@material-ui/icons/Refresh';
/*
import MultiGraph from "../MultiGraph";
*/
import {usePipe} from "../../lib/UseObs";
import {lookup} from "../../lib/ReactiveClasses/EditingCard";
import {filter} from "rxjs/operators";
import {TutorialPopper} from "../Popover/Tutorial";
import {useObservableState} from "observable-hooks";

const useStyles = makeStyles((theme) => ({
    popupParent: {
        display: 'flex',
        flexFlow: 'column nowrap',
        backgroundColor: theme.palette.background.paper
    },
    titleRow: {
        display: 'flex',
        justifyContent: "center",
        height: 'fit-content'
    },
    learningLanguage: {
        flexGrow: 1
    },
    recognizedSpeech: {}
}));

export const SLIM_CARD_CONTENT = {display: 'flex', flexFlow: 'row nowrap', paddingTop: '5px', paddingBottom: 0, paddingLeft: '5px'};

export default function AudioRecorder({m}: { m: Manager }) {
    const classes = useStyles();
    const r = m.audioManager.audioRecorder;
    /*
        const userAudio = useObservableState(r.userAudio$);
    */
    const synthAudio = useObservableState(m.currentEditingSynthesizedWavFile$);
    /*
        const graphData = useObs<number[][]>(m.audioManager.lineupGraphs$)
    */
    const canvasRef = useRef<HTMLCanvasElement>();
    const currentAudioRequest = useObservableState(r.currentRecordRequest$);
    const retryableAudioRequest = usePipe(r.currentRecordRequest$, o => o.pipe(filter(v => !!v)));
    const recognizedText = useObservableState(r.speechRecongitionText$);

    useEffect(() => {
        if (canvasRef.current) r.canvas$.next(canvasRef.current)
    }, [canvasRef])

    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

    return <div className={classes.popupParent} ref={setReferenceElement}>
        <Card>
            <CardContent style={SLIM_CARD_CONTENT}>
                <TutorialPopper referenceElement={referenceElement} storageKey={'AUDIO_POPUP'} placement="top">
                    <Typography variant="subtitle2">Test your pronunciation by speaking when the light is green. The
                        recognized text should match the pinyin on the flashcard.</Typography>
                </TutorialPopper>
                <CountdownCircle r={r}/>
                <Typography variant="h6" className={classes.learningLanguage}
                            align="center">{currentAudioRequest?.label}</Typography>
{/*
                <SineWave r={r}/>
*/}
                <Typography variant="h6"
                            className={classes.recognizedSpeech}>{recognizedText} {lookup(recognizedText || '').join(' ')}</Typography>
                {/*
                    <Grid item xs={6}>
                        <audio src={userAudio?.url} controls autoPlay />
                    </Grid>
*/}
                <audio style={{height: '24px'}} src={synthAudio?.url} controls autoPlay/>
                {/*
                {graphData && <MultiGraph plots={graphData}/>}
*/}
                <IconButton style={{height: '24px', width: '24px'}} disabled={!retryableAudioRequest} onClick={() => r.currentRecordRequest$.next(retryableAudioRequest)} aria-label="retry">
                    <RefreshIcon style={{height: '24px', width: '24px'}} />
                </IconButton>
            </CardContent>
        </Card>
    </div>
}