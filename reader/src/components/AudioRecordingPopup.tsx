import {RenderingBook} from "../lib/Books/Rendering/RenderingBook";
import React, {useEffect, useRef} from "react";
import Collapse from '@material-ui/core/Collapse';
import {Manager} from "../lib/Manager/Manager";
import {useObs} from "../UseObs";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Divider from "@material-ui/core/Divider";
import {ExpansionPanelNoMargin} from "./ExpansionPanelNoMargin";
import {Card, IconButton, withStyles} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
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
        height: '200px'
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
    const synthAudio = useObs(m.currentEditingSynthesizedWavFile$)

    return <Card className={classes.root}>
        <div>active: {isRecording ? "True" : "False"}</div>
        <div>label: {req?.label}</div>
        <div>mediaSource active: {mediaSource?.active}</div>
        <div>mediaSource id: {mediaSource?.id}</div>
        <canvas ref={canvasRef} className={classes.canvas}/>
        <audio src={userAudio?.url} controls/>
        <audio src={synthAudio?.url} controls/>
    </Card>
    ;
}
