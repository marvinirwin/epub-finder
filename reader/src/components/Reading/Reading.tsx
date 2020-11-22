import React, {useState} from "react";
import { Manager } from "../../lib/Manager";
import {OpenedBook} from "../../lib/Atomized/OpenedBook";
import { PronunciationVideo } from "../PronunciationVideo/PronunciationVideo";
import AudioRecorder from "../AudioPopup/AudioRecorder";
import {ExpandableContainer} from "../Containers/ExpandableContainer";
import {useObservableState} from "observable-hooks";
import {withLatestFrom} from "rxjs/operators";

export const Reading: React.FunctionComponent<{m: Manager}> = ({m}) => {
    const openedBook = m.openedBooks.readingBookService.readingBook;
    const socketConnected = useObservableState(m.observableService.connected$, false);
    const lastVideoMetadata = useObservableState(m.observableService.videoMetadata$);
    const showPronunciationVideo = !!useObservableState(m.pronunciationVideoService.videoMetaData$);
    const showRecording = !!useObservableState(m.audioManager.audioRecorder.isRecording$);
    return <div className={'reading-container'}>
        <ExpandableContainer shouldShow={showRecording} hideDelay={5000}>
            <AudioRecorder m={m}/>
        </ExpandableContainer>
        <ExpandableContainer shouldShow={socketConnected} hideDelay={5000}>
            <h6>Latest video metadata</h6>
            <div>{JSON.stringify(lastVideoMetadata)}</div>
        </ExpandableContainer>
        <ExpandableContainer shouldShow={showPronunciationVideo}>
            <PronunciationVideo m={m}/>
        </ExpandableContainer>
        <OpenedBook openedBook={openedBook}/>
    </div>
}