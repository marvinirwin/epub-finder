import {makeStyles} from "@material-ui/core/styles";
import React, {useEffect, useRef} from "react";
import {Button, Card, CardActions, CardContent, Grid, Typography} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import CountdownCircle from "./CountdownCircle";
import SineWave from "./SineWave";
/*
import MultiGraph from "../MultiGraph";
*/
import {useObs, usePipe} from "../../lib/UseObs";
import {lookup} from "../../lib/ReactiveClasses/EditingCard";
import {filter} from "rxjs/operators";

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
    recognizedSpeech: {
    }
}));

export default function AudioPopup({m}:{m: Manager}) {
    const classes = useStyles();
    const r = m.audioManager.audioRecorder;
/*
    const userAudio = useObs(r.userAudio$);
*/
    const synthAudio = useObs(m.currentEditingSynthesizedWavFile$);
/*
    const graphData = useObs<number[][]>(m.audioManager.lineupGraphs$)
*/
    const canvasRef = useRef<HTMLCanvasElement>();
    const currentAudioRequest = useObs(r.recordRequest$);
    const retryableAudioRequest = usePipe(r.recordRequest$, o => o.pipe(filter(v => !!v)));
    const recognizedText = useObs(r.speechRecongitionText$);

    useEffect(() => {
        if (canvasRef.current) r.canvas$.next(canvasRef.current)
    }, [canvasRef])

    return <div className={classes.popupParent}>
        <Card>
            <CardContent>
                <div className={classes.titleRow}>
                    <div style={{justifySelf: "start"}}>
                        <CountdownCircle r={r}/>
                    </div>
                    <Typography variant="h3" className={classes.learningLanguage} align="center">{currentAudioRequest?.label}</Typography>
                </div>
                <SineWave r={r}/>
                <Typography variant="h3" className={classes.recognizedSpeech}>{recognizedText} {lookup(recognizedText || '').join(' ')}</Typography>
                <Grid container>
{/*
                    <Grid item xs={6}>
                        <audio src={userAudio?.url} controls autoPlay />
                    </Grid>
*/}
                    <Grid item xs={12}>
                        <audio src={synthAudio?.url} controls autoPlay />
                    </Grid>
                </Grid>
{/*
                {graphData && <MultiGraph plots={graphData}/>}
*/}
            </CardContent>
            <CardActions>
                <Button disabled={!retryableAudioRequest} onClick={() => r.recordRequest$.next(retryableAudioRequest)}>Retry</Button>
            </CardActions>
        </Card>
    </div>
}