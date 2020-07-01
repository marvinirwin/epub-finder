import {makeStyles} from "@material-ui/core/styles";
import React, {useEffect, useRef} from "react";
import {Button, Card, CardActions, CardContent, Grid, Typography} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import CountdownCircle from "./CountdownCircle";
import SineWave from "./SineWave";
import MultiGraph from "../MultiGraph";
import {useObs} from "../../lib/UseObs";

const useStyles = makeStyles((theme) => ({
    popupParent: {
        display: 'flex',
        flexFlow: 'column nowrap',
        backgroundColor: theme.palette.background.paper
    },
    titleRow: {
        display: 'flex',
        justifyContent: "center",
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
    const userAudio = useObs(r.userAudio$);
    const synthAudio = useObs(m.currentEditingSynthesizedWavFile$);
    const graphData = useObs<number[][]>(m.audioManager.lineupGraphs$)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const currentAudioRequest = useObs(r.recordRequest$);
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
                <Typography variant="h3" className={classes.recognizedSpeech}>{recognizedText}</Typography>
                <Grid container>
                    <Grid item xs={6}>
                        <audio src={userAudio?.url} controls autoPlay />
                    </Grid>
                    <Grid item xs={6}>
                        <audio src={synthAudio?.url} controls autoPlay />
                    </Grid>
                </Grid>
                {graphData && <MultiGraph plots={graphData}/>}
            </CardContent>
            <CardActions>
                <Button>Retry</Button>
            </CardActions>
        </Card>
    </div>
}