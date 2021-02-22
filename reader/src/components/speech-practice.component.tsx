import {ManagerContext} from "../App";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Mic} from "@material-ui/icons";
import {SpeechPracticeCard} from "./speech-practice-card";
import {Button, Card, CardActions} from "@material-ui/core";
import {RecordRequest} from "../lib/Util/RecordRequest";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            margin: theme.spacing(5),
            minWidth: 275,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }
    }),
);

export const SpeechPractice = () => {
    const m = useContext(ManagerContext);
    const classes = useStyles();
    const isRecording = useObservableState(m.audioRecordingService.audioRecorder.isRecording$);
    const recordingClassName = isRecording ? 'recording' : '';
    const [micRef, setMicRef] = useState<SVGSVGElement | null>()
    useEffect(() => {
        if (micRef) {
            m.micFeedbackService.micRef$.next(micRef);
        }
    }, [micRef]);

    const record = useCallback(() => {
        m.audioRecordingService.audioRecorder.recordRequest$.next(new RecordRequest(``));
    }, [])

    useEffect(() => {
        record();
    }, []);

    useSubscription(m.browserInputs.getKeyDownSubject('q'), () => {
        record()
    })
    return <div id={'speech-practice-container'}>
        <Card style={{
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'center'
        }}>
            <div className={classes.icon}>
                <Mic color={isRecording ? 'primary' : undefined} ref={setMicRef}
                     id='speech-practice-recording-indicator' className={recordingClassName}/>
            </div>
            <CardActions>
                <Button size="large"
                        variant='contained'
                        onClick={record}
                        style={{margin: 8 * 4}}
                        color={isRecording ? undefined : 'primary'}
                >
                    {isRecording ? 'Recognizing' : 'Recognize (q)'}
                </Button>
            </CardActions>
        </Card>
        <SpeechPracticeCard/>
    </div>
}
