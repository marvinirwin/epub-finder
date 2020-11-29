import {Manager} from "../../lib/Manager";
import React, {useContext, useEffect, useLayoutEffect, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {CharacterTimingSection} from "./CharacterTimingSection";
import {useChunkedAudioBuffer, useChunkedCharacterTimings} from "./useChunkedCharacterTimings";
import {boundedPoints} from "./math.module";
import {useRecordVideoTime} from "./useRecordVideoTime";
import {useInterval} from "./useInterval";
import {useSetVideoTime} from "./useSetVideoTime";
import {useSetTemporalPositionBar} from "./useSetTemporalPositionbar";
import {AudioRecorderResizedContext} from "../Main";
import {useRecordCurrentTime} from "./useRecordCurrentTime";
import {useApplyPlaybackTime} from "./useApplyPlaybackTime";
import {useApplyPlaybackSpeed} from "./useApplyPlaybackRate";
import {PronunciationVideo} from "./pronunciation-video.component";


export const PronunciationVideoContainer: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const [highlightBarPosition1Ms, setHighlightBarP1] = useState<number>();
    const [highlightBarPosition2Ms, setHighlightBarP2] = useState<number>();
    const [replayDragInProgress, setReplayDragInProgress] = useState<boolean>(false);
    const [pronunciationSectionsContainer, setPronunciationSectionsContainer] = useState<HTMLDivElement | null>();
    const editingIndex = useObservableState(m.editingVideoMetadataService.editingCharacterIndex$);
    const isEditing = editingIndex !== undefined && editingIndex >= 0;

    useEffect(() => {
        if (isEditing && replayDragInProgress) {
            setHighlightBarP1(undefined);
            setHighlightBarP2(undefined);
            setReplayDragInProgress(false);
        }
    }, [isEditing, replayDragInProgress])

    const sectionWidth = pronunciationSectionsContainer?.clientWidth;
    const millisecondsPerSection = sectionWidth ? sectionWidth * 5 : undefined;

    const videoMetadata = useObservableState(m.pronunciationVideoService.videoMetadata$);
    const chunkedCharacterTimings = useChunkedCharacterTimings(
        videoMetadata,
        millisecondsPerSection
    );

    const chunkedAudioBuffers = useObservableState(m.pronunciationVideoService.chunkedAudioBuffers$, []);
    const currentSentence = useObservableState(m.pronunciationVideoService.videoSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.videoCharacterIndex$);

    const [highlightStartMs, highlightStopMs] = ((highlightBarPosition1Ms || 0) > (highlightBarPosition2Ms || 0)) ?
        [highlightBarPosition2Ms, highlightBarPosition1Ms] :
        [highlightBarPosition1Ms, highlightBarPosition2Ms];

    let characterCounter = 0;

    const videoTimeMs = useObservableState(m.pronunciationVideoService.videoPlaybackTime$);

    return <Card className={'pronunciation-video-container-card'}>
        <div
            className={`pronunciation-sections-container`}
            ref={setPronunciationSectionsContainer}>
            {
                (chunkedCharacterTimings && videoMetadata && millisecondsPerSection)
                && chunkedCharacterTimings.map((chunkedCharacterTiming, lineIndex) => {
                    const lineStartTime = lineIndex * millisecondsPerSection;
                    const lineEndTime = lineStartTime + millisecondsPerSection;
                    let progressBarPosition;
                    if (videoTimeMs) {
                        const currentChunkIndex = Math.floor(videoTimeMs / millisecondsPerSection);
                        if (currentChunkIndex === lineIndex) {
                            progressBarPosition = ((videoTimeMs % millisecondsPerSection) / millisecondsPerSection) * 100;
                        }
                    }
                    const hasPoints = highlightStartMs !== undefined && highlightStopMs !== undefined;
                    const highlightBarPoints = hasPoints
                        ? boundedPoints(
                            highlightStartMs as number,
                            highlightStopMs as number,
                            lineStartTime,
                            lineEndTime - 1
                        ).map(p => p && (p - (millisecondsPerSection * lineIndex)) / millisecondsPerSection) :
                        [];
                    const previousCharacterCount = characterCounter
                    characterCounter += chunkedCharacterTiming.length;

                    return <CharacterTimingSection
                        key={lineIndex}
                        characterTimings={chunkedCharacterTiming}
                        videoMetaData={videoMetadata}
                        sectionDurationMs={millisecondsPerSection}
                        sectionWidthPx={sectionWidth || 0}
                        progressBarPercentPosition={progressBarPosition}
                        sectionIndex={lineIndex}
                        characterIndexStart={previousCharacterCount}
                        onClick={percent => {
                            m.pronunciationVideoService.setVideoPlaybackTime$.next(lineIndex *
                                millisecondsPerSection / 1000 +
                                (millisecondsPerSection / 1000 * percent / 100));
                        }}
                        onMouseOver={percentage => {
                            if (replayDragInProgress) {
                                setHighlightBarP2(lineStartTime + (percentage / 100 * millisecondsPerSection))
                            }
                        }}
                        onMouseDown={percentage => {
                            setReplayDragInProgress(true)
                            setHighlightBarP1(lineStartTime + (percentage / 100 * millisecondsPerSection))
                        }}
                        onMouseUp={percentage => {
                            setReplayDragInProgress(false)
                        }}
                        highlightStartPosition={highlightBarPoints[0]}
                        highlightEndPosition={highlightBarPoints[1]}
                        audioBuffer={chunkedAudioBuffers?.[lineIndex]}
                    />;
                })
            }
        </div>
        <PronunciationVideo
            highlightBarPosition1Ms={highlightBarPosition1Ms}
            highlightBarPosition2Ms={highlightBarPosition2Ms}
            currentSentenceCharacterIndex={currentSentenceCharacterIndex}/>
    </Card>
}
