import React, {useContext} from "react";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {Typography} from "@material-ui/core";

export const LatestRecognizedText = () => {
    const m = useContext(ManagerContext)
    const recorder = m.audioRecordingService.audioRecorder;

    const recognizedText = useObservableState(recorder.currentRecognizedText$, '');
    const currentRomanized = useObservableState(m.speechPracticeService.romanization$);
    const currentAudioRequest = useObservableState(recorder.recordRequest$);
    return <>
        <Typography variant="h6">{currentAudioRequest?.label}</Typography>
        <Typography variant="h6">{recognizedText}</Typography>
        <Typography variant="h6">{currentRomanized}</Typography>
    </>;
};