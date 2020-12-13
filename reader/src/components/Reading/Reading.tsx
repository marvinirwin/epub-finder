import React, {useContext, useMemo, useState} from "react";
import {Manager} from "../../lib/Manager";
import {OpenedBook} from "../../lib/Atomized/OpenedBook";
import AudioRecorder from "../AudioPopup/AudioRecorder";
import {ExpandableContainer} from "../Containers/ExpandableContainer";
import {useObservableState} from "observable-hooks";
import {AudioRecorderResizedContext, PronunciationVideoResizedContext} from "../Main";
import {PronunciationVideoContainer} from "../PronunciationVideo/pronunciation-video-container.component";

export const Reading: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const openedBook = m.readingBookService.readingBook;
    const showPronunciationVideo = !!useObservableState(m.pronunciationVideoService.videoMetadata$);
    const recentlyRecorded = !!useObservableState(m.audioManager.audioRecorder.recentlyRecorded$);

    return <div className={'reading-container'}>
        <ExpandableContainer
            shouldShow={recentlyRecorded}
            resizeObservable$={useContext(AudioRecorderResizedContext)}
        >
            <AudioRecorder m={m}/>
        </ExpandableContainer>
        <ExpandableContainer shouldShow={showPronunciationVideo}
                             resizeObservable$={useContext(PronunciationVideoResizedContext)}>
            <PronunciationVideoContainer m={m}/>
        </ExpandableContainer>
        <OpenedBook ref={ref => m.introService.readingFrameRef$.next(ref)}
                    openedBook={openedBook}
        />
    </div>
}