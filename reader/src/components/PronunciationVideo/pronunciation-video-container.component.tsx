import {Manager} from "../../lib/Manager";
import React, {useEffect, useRef, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {CharacterTimingSection} from "./CharacterTimingSection";
import {useChunkedCharacterTimings} from "./useChunkedCharacterTimings";
import {boundedPoints} from "./math.module";
import {PronunciationVideo} from "./pronunciation-video.component";
import {useDebouncedFn, useResizeObserver, useTimeout} from "beautiful-react-hooks";
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
    })

    const startDrag = useDebouncedFn((
        highlightBarMsP1: number,
        setHighlightBarMsP1: (n: number) => void,
        setReplayDragInProgress: (b: boolean) => void,
    ) => {
        debugger;
        setHighlightBarMsP1(highlightBarMsP1);
        setReplayDragInProgress(true);
    }, DRAG_TIMEOUT, {leading: false, trailing: true});

    const stopDrag = () => {
        startDrag.cancel();
        setHighlightBarMsP1(undefined);
        setHighlightBarMsP2(undefined);
        setReplayDragInProgress(false);
    };

    useEffect(() => {
        return () => startDrag.cancel()
    }, [])

    let characterCounter = 0;

    return <Card className={'pronunciation-video-container-card'}>
        <PronunciationVideo
            highlightBarPosition1Ms={highlightBarPosition1Ms}
            highlightBarPosition2Ms={highlightBarPosition2Ms}
            currentSentenceCharacterIndex={currentSentenceCharacterIndex}/>

        {/* @ts-ignore */}
        <div className={`pronunciation-sections-container`}  ref={pronunciationSectionsContainer}>
            {
                (chunkedCharacterTimings && videoMetadata && sectionLengthMs)
                && chunkedCharacterTimings.map((chunkedCharacterTiming, lineIndex) => {
                    const section = new PronunciationSection(
                        {
                            sectionLengthMs,
                            lineIndex,
                            firstCharacterIndex: characterCounter,
                            videoTimeMs: videoTimeMs,
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
                        onClick={fraction => {
                            if (!replayDragInProgress) {
                                stopDrag();
                                m.pronunciationVideoService.setVideoPlaybackTime$.next(section.newVideoTimeMs(fraction));
                            }
                        }}
                        onMouseOver={fraction => {
                            if (replayDragInProgress) {
                                setHighlightBarMsP2(section.highlightBarNewPosition(fraction));
                            }
                        }}
                        onMouseDown={fraction => {
                            debugger;
                            startDrag(
                                section.highlightBarNewPosition(fraction),
                                setHighlightBarMsP1,
                                setReplayDragInProgress
                            )
                        }}
                        highlightStartPosition={highlightBarPoints?.[0] || 0}
                        highlightEndPosition={highlightBarPoints?.[1] || 0}
                        audioBuffer={chunkedAudioBuffers?.[lineIndex]}
                    />;
                })
            }
        </div>
    </Card>
}
