import React, {useEffect, useRef} from "react";
import {AudioRecorder} from "../../lib/AudioRecorder";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    canvas: {
        flexGrow: 1,
        height: '50px',
        width: '100%'
    },
}));
export default function SineWave({r}: { r: AudioRecorder }) {
    const classes = useStyles();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current) r.canvas$.next(canvasRef.current)
    }, [canvasRef])

    return <div>
        <canvas ref={canvasRef} className={classes.canvas}/>
    </div>
}