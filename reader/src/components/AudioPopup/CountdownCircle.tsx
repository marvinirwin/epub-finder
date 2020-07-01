import {AudioRecorder} from "../../lib/AudioRecorder";
import {Typography} from "@material-ui/core";
import React from "react";
import {useObs} from "../../lib/UseObs";

export default function CountdownCircle({r}: {r: AudioRecorder}) {
    const countdown = useObs(r.countdown$);
    const isRecording = useObs(r.isRecording$);
    return <div>
        <div className="led-box">
            <div className={isRecording ? 'led-red' : 'led-off'}><Typography variant="h3" align="center">{countdown}</Typography></div>
        </div>
    </div>
}