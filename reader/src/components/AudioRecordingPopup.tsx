import {RenderingBook} from "../lib/Books/Rendering/RenderingBook";
import React, {useEffect, useRef} from "react";
import Collapse from '@material-ui/core/Collapse';
import {Manager} from "../lib/Manager";
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

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        display: "flex",
        flexFlow: 'column nowrap'
    },
    waves: {

    },
    graph: {

    }
}));

export function AudioRecordingPopup({r}: {r: AudioRecorder}) {
    const classes = useStyles();
    const mediaSource = useObs(r.mediaSource$);
    const isRecording = useObs(r.isRecording$);
    const req = useObs(r.recordRequest$);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const graphRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (canvasRef.current) r.canvas$.next(canvasRef.current)
    }, [canvasRef])


    return <Card className={classes.root}>
        <div>active: {isRecording}</div>
        <div>label: {req?.label}</div>
        <div>mediaSource active: {mediaSource?.active}</div>
        <div>mediaSource id: {mediaSource?.id}</div>
        <div ref={graphRef}/>
        <canvas ref={canvasRef} className={classes.waves}/>
    </Card>
    ;
}
