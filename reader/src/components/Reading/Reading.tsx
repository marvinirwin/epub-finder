import React, {useContext, useState} from "react";
import { Manager } from "../../lib/Manager";
import {OpenedBook} from "../../lib/Atomized/OpenedBook";
import { PronunciationVideo } from "../PronunciationVideo/PronunciationVideo";
import AudioRecorder from "../AudioPopup/AudioRecorder";
import {ExpandableContainer} from "../Containers/ExpandableContainer";
import {useObservableState} from "observable-hooks";
import {AudioRecorderResizedContext, PronunciationVideoResizedContext} from "../Main";

export const Reading: React.FunctionComponent<{m: Manager}> = ({m}) => {
    const openedBook = m.openedBooks.readingBookService.readingBook;
    const showPronunciationVideo = !!useObservableState(m.pronunciationVideoService.videoMetadata$);
    const recentlyRecorded = !!useObservableState(m.audioManager.audioRecorder.recentlyRecorded$);
    return <div className={'reading-container'}>
        <ExpandableContainer shouldShow={recentlyRecorded} resizeObservable$={useContext(AudioRecorderResizedContext)}>
            <AudioRecorder m={m}/>
        </ExpandableContainer>
        <ExpandableContainer shouldShow={showPronunciationVideo} resizeObservable$={useContext(PronunciationVideoResizedContext)}>
            <PronunciationVideo m={m}/>
        </ExpandableContainer>
        <OpenedBook openedBook={openedBook}/>
    </div>
}