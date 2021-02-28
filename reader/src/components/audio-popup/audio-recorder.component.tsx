import React, {useContext, useState} from "react";
import {LinearProgress, Typography} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import {TutorialPopper} from "../popover/tutorial-popper.component";
import {useObservableState} from "observable-hooks";
import {AudioRecorderResizedContext} from "../main";

export const SLIM_CARD_CONTENT = {
    display: 'flex',
    flexFlow: 'row nowrap',
    paddingTop: '5px',
    paddingBottom: 0,
    paddingLeft: '5px'
};

export default function AudioRecorderComponent({m}: { m: Manager }) {
    const recorder = m.audioRecordingService.audioRecorder;
    const isRecording = useObservableState(recorder.isRecording$);

    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);

    const audioRecorderResize = useContext(AudioRecorderResizedContext)
/*
    useEffect(() => {
        audioRecorderResize.next()
    }, [recognizedText])
*/

    return <div className={'audio-recorder-popup'}>
        {isRecording && <LinearProgress variant='indeterminate'/>}
        <TutorialPopper
            referenceElement={referenceElement}
            storageKey={'AUDIO_POPUP'}
            placement="top"
        >
            <Typography variant="subtitle2">Test your pronunciation by speaking when the light is green. The
                recognized text should match the pinyin on the flashcard.</Typography>
        </TutorialPopper>
    </div>
}