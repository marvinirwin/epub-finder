import {AudioRecorder} from "../../lib/AudioRecorder";
import {Typography} from "@material-ui/core";
import React from "react";
import {useObs} from "../../lib/UseObs";
import {useObservableState} from "observable-hooks";

export default function CountdownCircle({r}: {r: AudioRecorder}) {
    const countdown = useObservableState(r.countdown$);
    const isRecording = useObservableState(r.isRecording$);
    return <div className="container">
        <div className="led-box">
            <div className={'led ' + (isRecording ? 'led-green' : 'led-off')}><Typography variant="subtitle2" align="center">{countdown === 0 ? '' : countdown}</Typography></div>
        </div>
    </div>
}