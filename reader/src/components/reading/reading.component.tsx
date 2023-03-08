import React, { useContext  } from 'react'
import { Manager } from '../../lib/manager/Manager'
import { useObservableState } from 'observable-hooks'
import {
    AudioRecorderResizedContext,
    PronunciationVideoResizedContext,
} from '../main'
import { PronunciationVideoContainer } from '../pronunciation-video/pronunciation-video-container.component'
import { ExpandableContainer } from '../app-container/expandable-container'
import { OpenDocumentComponent } from './open-document.component'
import {ManagerContext} from "../../App";

export const ReadingComponent: React.FunctionComponent = ({
}) => {
    const m = useContext(ManagerContext)
    const readingDocument = m.readingDocumentService.readingDocument
    const showPronunciationVideo = !!useObservableState(
        m.pronunciationVideoService.videoMetadata$,
    )

    return (
        <div className={'reading-container'}>
            <ExpandableContainer
                shouldShow={showPronunciationVideo}
                resizeObservable$={useContext(PronunciationVideoResizedContext)}
            >
                <PronunciationVideoContainer m={m} />
            </ExpandableContainer>
            <OpenDocumentComponent
                ref={(ref) => m.introService.readingFrameRef$.next(ref)}
                openedDocument={readingDocument}
                id={'reading-document'}
            />
        </div>
    )
}
