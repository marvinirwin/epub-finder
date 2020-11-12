import {Manager} from "../../lib/Manager";
import React, {useEffect, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {CharacterTimingSection} from "./CharacterTimingSection";
import {useChunkedCharacterTimings} from "./useChunkedCharacterTimings";
import {boundedPoints} from "./math.service";
import {useVideoTime} from "./useVideoTime";
import {useVideoMetaData} from "./useVideoMetaData";
import {useInterval} from "./useInterval";


export const PronunciationVideo: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const currentSentence = useObservableState(m.inputManager.hoveredSentence$);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.hoveredCharacterIndex$);
    const [videoElementRef, setVideoElementRef] = useState<HTMLVideoElement | null>();
    const [highlightBarPosition1Ms, setHighlightBarP1] = useState<number>();
    const [highlightBarPosition2Ms, setHighlightBarP2] = useState<number>();
    const [replayDragInProgress, setReplayDragInProgress] = useState<boolean>(false);
    const [pronunciationSectionsContainer, setPronunciationSectionsContainer] = useState<HTMLDivElement | null>();
    const [hidden, setHidden] = useState(true)

    const sectionWidth = pronunciationSectionsContainer?.clientWidth;
    const millisecondsPerSection = sectionWidth ? sectionWidth * 10 : undefined;

    const videoTime = useVideoTime(videoElementRef);
    const videoMetaData = useVideoMetaData(currentSentence)
    const chunkedCharacterTimings = useChunkedCharacterTimings(videoMetaData, sectionWidth);


    useEffect(() => {
        if (videoElementRef
            && currentSentence
            && (currentSentenceCharacterIndex === 0 || currentSentenceCharacterIndex)
            && videoMetaData) {
            const time = videoMetaData?.characters[currentSentenceCharacterIndex]?.timestamp;
            const timeScale = videoMetaData?.timeScale;
            if (time && timeScale) {
                videoElementRef.currentTime = (time * timeScale) / 1000;
            }
        }
    }, [
        currentSentenceCharacterIndex,
        currentSentence,
        videoElementRef,
        videoMetaData
    ]);

    useEffect(() => {
        if (videoElementRef) {
            videoElementRef.playbackRate = 0.25;
            videoElementRef.volume = 0.5;

        }
    }, [videoElementRef]);


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


    useSubscription(m.hotkeyEvents.hideVideo$, () => setHidden(true));

    return <div className={'pronunciation-video-container'}>
        {videoMetaData ? <Card className={'pronunciation-video-container-card'}>
            {/*
        <div style={{position: 'absolute', top: 0, zIndex: 10}}>
            <HotkeyWrapper action={"HIDE_VIDEO"}>
                <IconButton
                    onClick={() => m.hotkeyEvents.hideVideo$.next()}
                >
                    <CancelPresentationIcon/>
                </IconButton>
            </HotkeyWrapper>
        </div>
*/}
            <div className={'pronunciation-sections-container'} ref={setPronunciationSectionsContainer}>
                {
                    (chunkedCharacterTimings && videoMetaData && millisecondsPerSection)
                    && chunkedCharacterTimings.map((chunkedCharacterTiming, lineIndex) => {
                        const lineStartTime = lineIndex * millisecondsPerSection;
                        const lineEndTime = lineStartTime + millisecondsPerSection;
                        let progressBarPosition;
                        if (videoTime) {
                            const currentChunkIndex = Math.floor(videoTime / millisecondsPerSection);
                            if (currentChunkIndex === lineIndex) {
                                // If this is the one with the current playing index
                                // The percentage gets send to the component
                                // Let it figure out its own width
                                progressBarPosition = ((videoTime % millisecondsPerSection) / millisecondsPerSection) * 100;
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

                        return <CharacterTimingSection
                            key={lineIndex}
                            characterTimings={chunkedCharacterTiming}
                            videoMetaData={videoMetaData}
                            sectionDuration={millisecondsPerSection}
                            progressBarPosition={progressBarPosition}
                            onClick={percent => {
                                if (videoElementRef) {
                                    videoElementRef.currentTime = lineIndex *
                                        millisecondsPerSection / 1000 +
                                        (millisecondsPerSection / 1000 * percent);
                                    if (videoElementRef.paused) {
                                        videoElementRef.play();
                                    }
                                }
                            }}
                            onMouseOver={percentage => {
                                if (replayDragInProgress) {
                                    setHighlightBarP2(lineStartTime + (percentage * millisecondsPerSection))
                                }
                            }}
                            onMouseDown={percentage => {
                                setReplayDragInProgress(true)
                                setHighlightBarP1(lineStartTime + (percentage * millisecondsPerSection))
                            }}
                            onMouseUp={percentage => {
                                setReplayDragInProgress(false)
                                // setHighlightBarP1(undefined)
                            }}
                            highlightStartPosition={highlightBarPoints[0]}
                            highlightEndPosition={highlightBarPoints[1]}
                        />;
                    })
                }
            </div>
            <video
                ref={setVideoElementRef}
                src={(currentSentence && videoMetaData) ? `${process.env.PUBLIC_URL}/video/${videoMetaData.filename}` : ''}
                autoPlay
                controls
            />
        </Card> : <span/>
        }
    </div>
}
