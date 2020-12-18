import React, {useContext, useMemo, useState} from "react";
import {Manager} from "../../lib/Manager";
import {OpenedDocument} from "../../lib/Atomized/OpenedDocument";
import AudioRecorder from "../AudioPopup/AudioRecorder";
import {ExpandableContainer} from "../Containers/ExpandableContainer";
import {useObservableState} from "observable-hooks";
import {AudioRecorderResizedContext, PronunciationVideoResizedContext} from "../Main";
import {PronunciationVideoContainer} from "../PronunciationVideo/pronunciation-video-container.component";

export const Reading: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const openedDocument = m.readingDocumentService.readingDocument;
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
        <OpenedDocument ref={ref => m.introService.readingFrameRef$.next(ref)}
                    openedDocument={openedDocument}
        />
    </div>
}