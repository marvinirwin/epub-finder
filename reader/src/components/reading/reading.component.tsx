import React, {useContext, useMemo, useState} from "react";
import {Manager} from "../../lib/Manager";
import {OpenDocumentComponent} from "../../lib/atomized/open-document.component";
import AudioRecorderComponent from "../audio-popup/audio-recorder.component";
import {ExpandableContainer} from "../containers/expandable-container";
import {useObservableState} from "observable-hooks";
import {AudioRecorderResizedContext, PronunciationVideoResizedContext} from "../main";
import {PronunciationVideoContainer} from "../pronunciation-video/pronunciation-video-container.component";

export const ReadingComponent: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const openedDocument = m.readingDocumentService.readingDocument;
    const showPronunciationVideo = !!useObservableState(m.pronunciationVideoService.videoMetadata$);

    return <div className={'reading-container'}>
        <ExpandableContainer shouldShow={showPronunciationVideo}
                             resizeObservable$={useContext(PronunciationVideoResizedContext)}>
            <PronunciationVideoContainer m={m}/>
        </ExpandableContainer>
        <OpenDocumentComponent
            ref={ref => m.introService.readingFrameRef$.next(ref)}
            openedDocument={openedDocument}
            id={'reading-document'}
        />
    </div>
}