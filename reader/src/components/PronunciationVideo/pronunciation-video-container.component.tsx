import {Manager} from "../../lib/Manager";
import React, {useEffect, useRef, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {CharacterTimingSection} from "./CharacterTimingSection";
import {useChunkedCharacterTimings} from "./useChunkedCharacterTimings";
import {PronunciationVideo} from "./pronunciation-video.component";
import {useResizeObserver} from "beautiful-react-hooks";
import {PronunciationSection} from "./pronunciation-section";


const DRAG_TIMEOUT = 500;
export const PronunciationVideoContainer: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const [highlightBarPosition1Ms, setHighlightBarMsP1] = useState<number>();
    const [highlightBarPosition2Ms, setHighlightBarMsP2] = useState<number>();
    const [replayDragInProgress, setReplayDragInProgress] = useState<boolean>(false);
    const pronunciationSectionsContainer = useRef<HTMLDivElement>();
    const editingIndex = useObservableState(m.editingVideoMetadataService.editingCharacterIndex$);
    const videoTimeMs = useObservableState(m.pronunciationVideoService.videoPlaybackTime$);
    const videoMetadata = useObservableState(m.pronunciationVideoService.videoMetadata$);
    const chunkedAudioBuffers = useObservableState(m.pronunciationVideoService.chunkedAudioBuffers$, []);
    const currentSentenceCharacterIndex = useObservableState(m.inputManager.videoCharacterIndex$);
    // @ts-ignore
    const box = useResizeObserver(pronunciationSectionsContainer)
    const sectionWidth = box?.width;
    const sectionLengthMs = sectionWidth ? sectionWidth * 5 : undefined;
    const chunkedCharacterTimings = useChunkedCharacterTimings(
        videoMetadata,
        sectionLengthMs
    );

    const isEditing = editingIndex !== undefined && editingIndex >= 0;

    useEffect(() => {
        if (isEditing && replayDragInProgress) {
            setHighlightBarMsP1(undefined);
            setHighlightBarMsP2(undefined);
            setReplayDragInProgress(false);
        }
    }, [isEditing, replayDragInProgress])

    useEffect(() => {
        m.pronunciationVideoService.chunkSizeSeconds$.next(
            sectionLengthMs ? sectionLengthMs / 1000 : undefined
        )
    }, [sectionLengthMs]);

    useSubscription(m.inputManager.getKeyDownSubject('q'), () => {
        setHighlightBarMsP1(undefined);
        setHighlightBarMsP2(undefined);
    });

    const [startDragTimeout, setStartDragTimeout] = useState<number | null>()
    const [mouseDownTime, setMouseDownTime] = useState<Date | null>();


    useSubscription(
        m.inputManager.getKeyDownSubject('Escape'),
        () => m.pronunciationVideoService.videoMetadata$.next(undefined)
    )

    const startDrag = (
        highlightBarMsP1: number,
        setHighlightBarMsP1: (n: number) => void,
        setReplayDragInProgress: (b: boolean) => void,
    ) => {
        setHighlightBarMsP1(highlightBarMsP1);
        setReplayDragInProgress(true);
    };

    let characterCounter = 0;

    return <Card className={'pronunciation-video-container-card'}>
        <PronunciationVideo
            highlightBarPosition1Ms={highlightBarPosition1Ms}
            highlightBarPosition2Ms={highlightBarPosition2Ms}
            currentSentenceCharacterIndex={currentSentenceCharacterIndex}/>

        {/* @ts-ignore */}
        <div className={`pronunciation-sections-container`} ref={pronunciationSectionsContainer}>
            {
                (chunkedCharacterTimings && videoMetadata && sectionLengthMs)
                && chunkedCharacterTimings.map((chunkedCharacterTiming, lineIndex) => {
                    const section = new PronunciationSection(
                        {
                            sectionLengthMs,
                            lineIndex,
                            firstCharacterIndex: characterCounter,
                            videoTimeMs,
                            highlightBarStartMs: highlightBarPosition1Ms,
                            highlightBarEndMs: highlightBarPosition2Ms
                        }
                    );
                    const previousCharacterCount = characterCounter
                    characterCounter += chunkedCharacterTiming.length;

                    const highlightBarPoints = section.highlightBarPoints();

                    return <CharacterTimingSection
                        key={lineIndex}
                        characterTimings={chunkedCharacterTiming}
                        videoMetaData={videoMetadata}
                        sectionDurationMs={sectionLengthMs}
                        sectionWidthPx={sectionWidth || 0}
                        progressBarFraction={section.timeBarFraction()}
                        sectionIndex={lineIndex}
                        characterIndexStart={previousCharacterCount}
                        highlightStartPosition={highlightBarPoints?.[0] || 0}
                        highlightEndPosition={highlightBarPoints?.[1] || 0}
                        audioBuffer={chunkedAudioBuffers?.[lineIndex]}
                        onClick={fraction => {
                            setReplayDragInProgress(false);
                            window.clearTimeout(startDragTimeout || undefined);
                            if (mouseDownTime) {
                                // If the click was fast enough then clear the range
                                if (new Date().getTime() - mouseDownTime.getTime() < DRAG_TIMEOUT) {
                                    setHighlightBarMsP1(undefined);
                                    setHighlightBarMsP2(undefined);
                                }
                            }
                            if (!replayDragInProgress) {
                                m.pronunciationVideoService.setVideoPlaybackTime$.next(section.newVideoTimeMs(fraction));
                            }
                        }}
                        onMouseOver={fraction => {
                            if (replayDragInProgress) {
                                setHighlightBarMsP2(section.highlightBarNewPosition(fraction));
                            }
                        }}
                        onMouseDown={fraction => {
                            setMouseDownTime(new Date());
                            setStartDragTimeout(window.setTimeout(() => {
                                startDrag(
                                    section.highlightBarNewPosition(fraction),
                                    setHighlightBarMsP1,
                                    setReplayDragInProgress
                                )
                            }, DRAG_TIMEOUT))
                        }}
                        onMouseUp={fraction => {
                            setReplayDragInProgress(false)
                        }}
                    />;
                })
            }
        </div>
    </Card>
}