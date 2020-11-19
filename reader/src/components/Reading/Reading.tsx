import React, {useState} from "react";
import { Manager } from "../../lib/Manager";
import {OpenedBook} from "../../lib/Atomized/OpenedBook";
import { PronunciationVideo } from "../PronunciationVideo/PronunciationVideo";
import AudioRecorder from "../AudioPopup/AudioRecorder";
import {ExpandableContainer} from "../Containers/ExpandableContainer";
import {useObservableState} from "observable-hooks";

export const Reading: React.FunctionComponent<{m: Manager}> = ({m}) => {
    const openedBook = m.openedBooks.readingBook;
    const showPronunciationVideo = !!useObservableState(m.pronunciationVideoService.videoMetaData$);
    const showRecording = !!useObservableState(m.audioManager.audioRecorder.isRecording$);
    const [resizeCallback, setResizeCallback] = useState<() => void>(() => () => {});
    return <div className={'reading-container'}>
        <ExpandableContainer shouldShow={showPronunciationVideo}>
            <PronunciationVideo m={m} onResized={resizeCallback}/>
        </ExpandableContainer>
        <ExpandableContainer shouldShow={showRecording} hideDelay={5000}>
            <AudioRecorder m={m}/>
        </ExpandableContainer>
        <OpenedBook openedBook={openedBook}/>
    </div>
}