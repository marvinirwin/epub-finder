import {ManagerContext} from "../App";
import React, {useContext, useEffect, useState} from "react";
import {useObservableState} from "observable-hooks";
import {Mic} from "@material-ui/icons";
import {SpeechPracticeCard} from "./speech-practice-card";
import {Button, Card, CardActions} from "@material-ui/core";
import {RecordRequest} from "../lib/Interfaces/RecordRequest";

export const SpeechPractice = () => {
    const m = useContext(ManagerContext);

    const isRecording = useObservableState(m.audioManager.audioRecorder.isRecording$);
    const recordingClassName = isRecording ? 'recording' : '';
    const [micRef, setMicRef] = useState<SVGSVGElement | null>()
    useEffect(() => {
        if (micRef) {
            m.micFeedbackService.micRef$.next(micRef);
        }
    }, [micRef]);
    useEffect(() => {
        m.audioManager.audioRecorder.recordRequest$.next(new RecordRequest(``));
    }, []);
    return <div id={'speech-practice-container'}>
        <Card style={{
            display: 'flex',
            flexFlow: 'column nowrap',
/*
            justifyContent: 'center',
*/
            alignItems: 'center'
        }}>
            <div style={{
                minWidth: '275px',
/*
                minHeight: '275px',
*/
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Mic ref={setMicRef} id='speech-practice-recording-indicator' className={recordingClassName}/>
            </div>
            <CardActions>
                <Button size="large" color="primary">
                    Record (Q)
                </Button>
            </CardActions>
        </Card>
        <SpeechPracticeCard/>
    </div>
}
