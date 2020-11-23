import {makeStyles} from "@material-ui/core/styles";
import React, {useContext, useEffect, useState} from "react";
import {Paper, Typography} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import RecordingCircle from "./RecordingCircle";
import {lookupPinyin} from "../../lib/ReactiveClasses/EditingCard";
import {TutorialPopper} from "../Popover/Tutorial";
import {useObservableState} from "observable-hooks";
import {switchMap} from "rxjs/operators";
import {fetchTranslation} from "../../services/translate.service";
import {ExpandableContainer} from "../Containers/ExpandableContainer";
import {AudioRecorderResizedContext} from "../Main";

const useStyles = makeStyles((theme) => ({
    popupParent: {
        display: 'flex',
        flexFlow: 'column nowrap',
        backgroundColor: theme.palette.background.paper
    },
    titleRow: {
        display: 'flex',
        justifyContent: "center",
        height: 'fit-content'
    },
    learningLanguage: {
        flexGrow: 1
    },
}));

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
        <RecordingCircle r={recorder}/>
        <div>{currentAudioRequest?.label}</div>
        <div>{recognizedText}</div>
        <div>{lookupPinyin(recognizedText).join(' ')}</div>
    </div>
}