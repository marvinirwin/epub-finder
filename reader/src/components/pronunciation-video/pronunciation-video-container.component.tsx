import {Manager} from "../../lib/Manager";
import React, {useEffect, useRef, useState} from "react";
import {useObservableState, useSubscription} from "observable-hooks";
import {Card} from "@material-ui/core";
import {CharacterTimingSectionComponent} from "./character-timing-section.component";
import {useChunkedCharacterTimings} from "./useChunkedCharacterTimings";
import {PronunciationVideo} from "./pronunciation-video.component";
import {useDebouncedFn, useResizeObserver} from "beautiful-react-hooks";
import {PronunciationSection} from "./pronunciation-section";
import {PlaybackSpeedComponent} from "../directory/playback-speed.component";
import {useHighlightBarPositionPercentage} from "./useSetHighlightBarPositionPercentage";

const DRAG_TIMEOUT = 500;

export const PronunciationVideoContainer: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const [highlightBarPosition1Ms, setHighlightBarMsP1] = useState(
        useObservableState(m.settingsService.playbackStartPercent$.obs$)
    );
    const [highlightBarPosition2Ms, setHighlightBarMsP2] = useState(
        useObservableState(m.settingsService.playbackEndPercent$.obs$)
    );
    const [replayDragInProgress, setReplayDragInProgress] = useState<boolean>(false);
    const pronunciationSectionsContainer = useRef<HTMLDivElement>();

    const editingIndex = useObservableState(m.editingVideoMetadataService.editingCharacterIndex$);
    const videoTimeMs = useObservableState(m.pronunciationVideoService.videoPlaybackTime$);
    const videoMetadata = useObservableState(m.pronunciationVideoService.videoMetadata$);


    const {chunkedAudioBuffers, max} = useObservableState(
        m.pronunciationVideoService.chunkedAudioBuffers$,
        {chunkedAudioBuffers: [], max: 0}
    );
    const currentSentenceCharacterIndex = useObservableState(m.browserInputs.videoCharacterIndex$);

    useHighlightBarPositionPercentage(
        highlightBarPosition1Ms || 0,
        highlightBarPosition2Ms || 0
    );

    // @ts-ignore
    const box = useResizeObserver(pronunciationSectionsContainer, 500)
    const sectionWidth = box?.width;
    const sectionLengthMs = sectionWidth ? sectionWidth * 5 : undefined;
    const chunkedCharacterTimings = useChunkedCharacterTimings(
        videoMetadata,
        sectionLengthMs
    );

    const isEditing = editingIndex !== undefined && editingIndex >= 0;

    useEffect(() => {
        if (isEditing && replayDragInProgress) {
            setHighlightBarMsP1(0);
            setHighlightBarMsP2(0);
            setReplayDragInProgress(false);
        }
    }, [isEditing, replayDragInProgress])

    useEffect(() => {
        m.pronunciationVideoService.chunkSizeSeconds$.next(
            sectionLengthMs ? sectionLengthMs / 1000 : undefined
        )
    }, [sectionLengthMs]);

    useSubscription(m.browserInputs.getKeyDownSubject('q'), () => {
        setHighlightBarMsP1(0);
        setHighlightBarMsP2(0);
    });


    const [startDragTimeout, setStartDragTimeout] = useState<number | null>()
    const [mouseDownTime, setMouseDownTime] = useState<Date | null>();


    useSubscription(
        m.browserInputs.getKeyDownSubject('Escape'),
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
        <div style={{}}>
            <PronunciationVideo
                highlightBarPosition1Ms={highlightBarPosition1Ms}
                highlightBarPosition2Ms={highlightBarPosition2Ms}
                currentSentenceCharacterIndex={currentSentenceCharacterIndex}/>
            <PlaybackSpeedComponent/>
        </div>

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

                    return <CharacterTimingSectionComponent
                        sectionWidth={box?.width}
                        normalMax={max}
                        key={lineIndex}
                        characterTimings={chunkedCharacterTiming}
                        videoMetaData={videoMetadata}
                        chunkSizeMs={sectionLengthMs}
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
                                    setHighlightBarMsP1(0);
                                    setHighlightBarMsP2(0);
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
