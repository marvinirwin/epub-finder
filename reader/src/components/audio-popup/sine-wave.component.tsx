import React, {useEffect, useRef} from "react";
import {AudioRecorder} from "../../lib/audio/audio-recorder.service";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    canvas: {
        flexGrow: 1,
        height: '20px',
        width: '40px'
    },
}));
export default function SineWaveComponent({r}: { r: AudioRecorder }) {
    const classes = useStyles();
    const canvasRef = useRef<HTMLCanvasElement>(null);
/*
    useEffect(() => {
        if (canvasRef.current) r.canvas$.next(canvasRef.current)
    }, [canvasRef])
*/

    return <div>
        <canvas ref={canvasRef} className={classes.canvas}/>
    </div>
}