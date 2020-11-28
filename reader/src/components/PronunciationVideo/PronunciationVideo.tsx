import {Manager} from "../../lib/Manager";
import React, {useContext, useEffect, useLayoutEffect, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {CharacterTimingSection} from "./CharacterTimingSection";
import {useChunkedCharacterTimings} from "./useChunkedCharacterTimings";
import {boundedPoints} from "./math.module";
import {useVideoTime} from "./useVideoTime";
import {useInterval} from "./useInterval";
import {useSetVideoTime} from "./useSetVideoTime";
import {useSetTemporalPositionBar} from "./useSetTemporalPositionbar";
import {AudioRecorderResizedContext} from "../Main";


export const PronunciationVideo: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.pronunciationVideoService.videoSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.videoCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [highlightBarPosition1Ms, setHighlightBarP1] = useState<number>();
    const [highlightBarPosition2Ms, setHighlightBarP2] = useState<number>();
    const [replayDragInProgress, setReplayDragInProgress] = useState<boolean>(false);
    const [pronunciationSectionsContainer, setPronunciationSectionsContainer] = useState<HTMLDivElement | null>();
    const [hidden, setHidden] = useState(true);
    const editingIndex = useObservableState(m.editingVideoMetadataService.editingCharacterIndex$);
    const editing = editingIndex !== undefined && editingIndex >= 0;


    useEffect(() => {
        if (editing && replayDragInProgress) {
            setHighlightBarP1(undefined);
            setHighlightBarP2(undefined);
            setReplayDragInProgress(false);
        }
    }, [editing, replayDragInProgress])

    const sectionWidth = pronunciationSectionsContainer?.clientWidth;
    const millisecondsPerSection = sectionWidth ? sectionWidth * 5 : undefined;

    const videoTimeMs = useVideoTime(videoElementRef, m.pronunciationVideoService);
    const videoMetadata = useObservableState(m.pronunciationVideoService.videoMetadata$);
    const chunkedCharacterTimings = useChunkedCharacterTimings(videoMetadata, millisecondsPerSection);

    useSetTemporalPositionBar(videoElementRef, currentSentence, currentSentenceCharacterIndex, videoMetadata);
    useSetVideoTime(videoElementRef);
    useSubscription(
        m.pronunciationVideoService.distinctSetVideoPlaybackTime$,
        currentTime => {
            if (videoElementRef) {
                videoElementRef.currentTime = currentTime / 1000;
            }
        });
    useSubscription(m.hotkeyEvents.hideVideo$, () => setHidden(true));
    useSubscription(m.settingsService.playbackSpeed$, speed => {
        if (videoElementRef) {
            videoElementRef.playbackRate = speed;
        }
    })

    useInterval(() => {
        if (videoElementRef && highlightBarPosition1Ms && highlightBarPosition2Ms) {
            // If the video is out of bounds, make it go back into bounds
            if (videoElementRef.currentTime * 1000 > highlightBarPosition2Ms) {
                videoElementRef.currentTime = highlightBarPosition1Ms / 1000
            }
        }
    }, 10)

    const [highlightStartMs, highlightStopMs] = ((highlightBarPosition1Ms || 0) > (highlightBarPosition2Ms || 0)) ?
        [highlightBarPosition2Ms, highlightBarPosition1Ms] :
        [highlightBarPosition1Ms, highlightBarPosition2Ms];

    const videoSource = !!(currentSentence && videoMetadata) ? `${process.env.PUBLIC_URL}/video/${videoMetadata.filename}` : undefined;
    const resizeContext = useContext(AudioRecorderResizedContext);
    let characterCounter = 0;
    return <Card className={'pronunciation-video-container-card'}>
        {videoSource && <video
            ref={setVideoElementRef}
            src={videoSource}
            autoPlay
            controls
            onCanPlay={() => resizeContext.next()}
        />}
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
                            if (videoElementRef) {
                                videoElementRef.currentTime = lineIndex *
                                    millisecondsPerSection / 1000 +
                                    (millisecondsPerSection / 1000 * percent / 100);
                                if (videoElementRef.paused) {
                                    videoElementRef.play();
                                }
                            }
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
                    />;
                })
            }
        </div>
    </Card>
}
