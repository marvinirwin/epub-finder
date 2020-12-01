import {makeStyles, createStyles, Theme} from "@material-ui/core/styles";
import React, {useContext, useEffect, useState} from "react";
import {LinearProgress, Typography} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import {lookupPinyin} from "../../lib/ReactiveClasses/EditingCard";
import {TutorialPopper} from "../Popover/Tutorial";
import {useObservableState} from "observable-hooks";
import {AudioRecorderResizedContext} from "../Main";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    }),
);

export const SLIM_CARD_CONTENT = {
    display: 'flex',
    flexFlow: 'row nowrap',
    paddingTop: '5px',
    paddingBottom: 0,
    paddingLeft: '5px'
};

export default function AudioRecorder({m}: { m: Manager }) {
    const recorder = m.audioManager.audioRecorder;
    const recognizedText = useObservableState(recorder.currentRecognizedText$, '');
    const currentAudioRequest = useObservableState(recorder.recordRequest$);
    const isRecording = useObservableState(recorder.isRecording$);
    const classes = useStyles();

    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

    const audioRecorderResize = useContext(AudioRecorderResizedContext)
    useEffect(() => {
        audioRecorderResize.next()
    }, [recognizedText])

    return <div className={'audio-recorder-popup'}>
        <TutorialPopper
            referenceElement={referenceElement}
            storageKey={'AUDIO_POPUP'}
            placement="top"
        >
            <Typography variant="subtitle2">Test your pronunciation by speaking when the light is green. The
                recognized text should match the pinyin on the flashcard.</Typography>
        </TutorialPopper>
        <Typography variant="h6">{currentAudioRequest?.label}</Typography>
        {isRecording && <LinearProgress variant='indeterminate'/>}
        <Typography variant="h6">{recognizedText}</Typography>
        <Typography variant="h6">{lookupPinyin(recognizedText).join(' ')}</Typography>
    </div>
}