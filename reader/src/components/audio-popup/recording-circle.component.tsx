import {AudioRecorder} from "../../lib/audio/audio-recorder.service";
import {Typography} from "@material-ui/core";
import React from "react";
import {useObservableState} from "observable-hooks";

export default function RecordingCircleComponent({r}: {r: AudioRecorder}) {
    const isRecording = useObservableState(r.isRecording$);
    return <div className="led-container">
        <div className="led-box">
            <div className={'led ' + (isRecording ? 'led-green' : 'led-off')}><Typography variant="subtitle2" align="center">{/*{countdown === 0 ? '' : countdown}*/}</Typography></div>
        </div>
    </div>
}