import {ManagerContext} from "../App";
import {useContext} from "react";
import {useObservableState} from "observable-hooks";
import React from "react";
import {Mic} from "@material-ui/icons";
import {SpeechPracticeCard} from "./speech-practice-card";

export const SpeechPractice = () => {
    const m = useContext(ManagerContext);

    const isRecording = useObservableState(m.audioManager.audioRecorder.isRecording$);
    const recordingClassName = isRecording ? 'recording' : '';
    return <div id={'speech-practice-container'}>
        <Mic id='speech-practice-recording-indicator' className={recordingClassName}/>
        <SpeechPracticeCard/>
    </div>
}
