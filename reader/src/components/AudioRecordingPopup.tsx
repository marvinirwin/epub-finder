import React, {useEffect, useRef} from "react";
import {Manager} from "../lib/Manager";
import {useObs} from "../lib/Worker/UseObs";
import {Card, CardContent} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {AudioRecorder} from "../lib/AudioRecorder";
import MultiGraph from "./MultiGraph";


function ElContainer({el}: {el: HTMLElement}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) {
            if (ref.current.children.length > 1) {
                throw new Error("Container has too many children")
            }
            let currentChild = ref.current.children.item(0);
            if (currentChild !== el) {
                if (currentChild) {
                    currentChild.remove();
                }
                ref.current.appendChild(el)
            }
        }
    }, [el, ref])
    return <div ref={ref}/>
}

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        display: "flex",
        flexFlow: 'column nowrap'
    },
    canvas: {
        width: '100%',
        height: '25px'
    },
}));


export function AudioRecordingPopup({r, m}: {r: AudioRecorder, m: Manager}) {
    const classes = useStyles();

    const mediaSource = useObs(r.mediaSource$);
    const req = useObs(r.recordRequest$);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const isRecording = useObs(r.isRecording$);
    useEffect(() => {
        if (canvasRef.current) r.canvas$.next(canvasRef.current)
    }, [canvasRef])

    const userAudio = useObs(r.userAudio$);
    const synthAudio = useObs(m.currentEditingSynthesizedWavFile$);
    const graphData = useObs<number[][]>(m.audioManager.lineupGraphs$)

    return <Card className={classes.root}>
        <CardContent>

        </CardContent>
        <div>active: {isRecording ? "True" : "False"}</div>
        <div>label: {req?.label}</div>
        <div>mediaSource active: {mediaSource?.active}</div>
        <div>mediaSource id: {mediaSource?.id}</div>
        <canvas ref={canvasRef} className={classes.canvas}/>
        <audio src={userAudio?.url} controls/>
        <audio src={synthAudio?.url} controls/>
        {graphData && <MultiGraph plots={graphData}/>}
    </Card>;
}
